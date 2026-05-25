from google.oauth2 import service_account
from googleapiclient.discovery import build
from core.config import settings
import os
import re

# Scopes for Google Drive
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def get_drive_service():
    """
    Authenticate and return the Google Drive service.
    Uses API key for public folders.
    """
    if settings.GOOGLE_API_KEY:
        return build('drive', 'v3', developerKey=settings.GOOGLE_API_KEY)

    # If using Service Account instead:
    if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        creds = service_account.Credentials.from_service_account_file(
            settings.FIREBASE_CREDENTIALS_PATH, scopes=SCOPES
        )
        return build('drive', 'v3', credentials=creds)

    return None


def list_audio_files(service, folder_id):
    """
    List ALL audio files in the given Google Drive folder, handling pagination.
    """
    if not service:
        return []

    query = f"'{folder_id}' in parents and (mimeType contains 'audio/') and trashed = false"
    all_files = []
    page_token = None

    while True:
        params = {
            "q": query,
            "fields": "nextPageToken, files(id, name, mimeType, size, modifiedTime)",
            "pageSize": 1000,
        }
        if page_token:
            params["pageToken"] = page_token

        result = service.files().list(**params).execute()
        all_files.extend(result.get('files', []))
        page_token = result.get('nextPageToken')
        if not page_token:
            break

    return all_files


def _parse_filename(file_name: str) -> tuple[str, str]:
    """
    Parse 'Artist - Title.ext' filenames into (artist, title).
    Falls back gracefully for non-standard names.
    """
    # Strip extension
    stem = file_name.rsplit('.', 1)[0]

    # Remove trailing (1), (2) duplicates
    stem = re.sub(r'\(\d+\)\s*$', '', stem).strip()

    # Try 'Artist - Title' split
    if ' - ' in stem:
        parts = stem.split(' - ', 1)
        artist = parts[0].strip()
        title  = parts[1].strip()
    else:
        # No dash: treat whole name as title
        artist = 'Unknown Artist'
        title  = stem.strip()

    return artist, title


import tempfile
import mutagen
from googleapiclient.http import MediaIoBaseDownload

def extract_metadata(service, file_id: str, file_name: str, file_mime: str = "") -> dict:
    """
    Build song metadata by downloading the file and parsing with Mutagen.
    Falls back to parsing the filename if download fails or is rate-limited.
    """
    artist_fallback, title_fallback = _parse_filename(file_name)
    
    ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else ''
    mime_map = {
        'flac': 'audio/flac',
        'mp3':  'audio/mpeg',
        'wav':  'audio/wav',
        'aac':  'audio/aac',
        'm4a':  'audio/mp4',
        'ogg':  'audio/ogg',
    }
    resolved_mime = mime_map.get(ext, file_mime or 'audio/mpeg')
    stream_url = f"https://www.googleapis.com/drive/v3/files/{file_id}?alt=media&key={settings.GOOGLE_API_KEY}"
    
    metadata = {
        "id":        file_id,
        "title":     title_fallback,
        "artist":    artist_fallback,
        "album":     "Unknown Album",
        "duration":  0,
        "mimeType":  resolved_mime,
        "streamUrl": stream_url,
    }

    if not service:
        return metadata

    # Attempt to download and parse deep metadata
    try:
        request = service.files().get_media(fileId=file_id)
        with tempfile.NamedTemporaryFile(delete=False) as fd:
            downloader = MediaIoBaseDownload(fd, request)
            done = False
            while not done:
                status, done = downloader.next_chunk()
            file_path = fd.name

        try:
            audio = mutagen.File(file_path)
            
            def get_tag(tags, keys):
                if not tags: return None
                for key in keys:
                    if key in tags:
                        val = tags[key]
                        return val[0] if isinstance(val, list) else str(val)
                return None

            if audio:
                if audio.tags:
                    title = get_tag(audio.tags, ['title', 'TIT2', 'tit2'])
                    if title: metadata['title'] = title
                    
                    artist = get_tag(audio.tags, ['artist', 'TPE1', 'tpe1'])
                    if artist: metadata['artist'] = artist
                    
                    album = get_tag(audio.tags, ['album', 'TALB', 'talb'])
                    if album: metadata['album'] = album
                    
                if hasattr(audio, 'info') and audio.info:
                    metadata['duration'] = int(audio.info.length)
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
                
    except Exception as e:
        print(f"Deep metadata extraction failed for {file_name}: {e}. Using fallback.")

    return metadata
