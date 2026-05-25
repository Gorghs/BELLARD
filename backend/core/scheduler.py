from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime
from services.drive_sync import get_drive_service, list_audio_files, extract_metadata
from services.algolia_service import index_songs, delete_songs
from core.config import settings
import json
import os

scheduler = AsyncIOScheduler()
CACHE_FILE = "cache/song_metadata.json"

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_cache(cache):
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f, indent=2)

async def sync_drive_to_algolia():
    print("Starting periodic Drive Sync (Incremental)...")
    service = get_drive_service()
    if not service:
        print("Drive sync skipped: No credentials provided.")
        return
        
    try:
        files = list_audio_files(service, settings.GOOGLE_DRIVE_FOLDER_ID)
        cache = load_cache()
        
        current_ids = {f['id']: f for f in files}
        cached_ids = set(cache.keys())
        
        new_or_modified_songs = []
        
        import asyncio
        # Find new and modified files — process one by one with a delay to prevent rate limiting
        for file_id, file_meta in current_ids.items():
            if file_id not in cache or cache[file_id].get('_modifiedTime') != file_meta.get('modifiedTime'):
                print(f"Indexing: {file_meta['name']}")
                try:
                    metadata = extract_metadata(
                        service, file_id, file_meta['name'],
                        file_mime=file_meta.get('mimeType', '')
                    )
                    metadata['_modifiedTime'] = file_meta.get('modifiedTime')
                    new_or_modified_songs.append(metadata)
                    cache[file_id] = metadata
                    # Save incrementally
                    save_cache(cache)
                    
                    # Sleep to avoid rate limiting
                    await asyncio.sleep(3)
                except Exception as file_err:
                    print(f"Skipping {file_meta['name']} due to error: {file_err}")
                    continue

        # Find deleted files
        deleted_ids = list(cached_ids - set(current_ids.keys()))
        
        if new_or_modified_songs:
            index_songs(new_or_modified_songs)
            
        if deleted_ids:
            delete_songs(deleted_ids)
            for d_id in deleted_ids:
                del cache[d_id]
                
        total = len(new_or_modified_songs)
        if total or deleted_ids:
            save_cache(cache)
            print(f"Sync complete: {total} added/updated, {len(deleted_ids)} deleted.")
        else:
            print("No changes detected in Google Drive.")
            
    except Exception as e:
        print(f"Error during Drive Sync: {e}")

def start_scheduler():
    # Run once immediately on startup
    scheduler.add_job(sync_drive_to_algolia, 'date', run_date=datetime.now())
    # Then run every 1 hour
    scheduler.add_job(sync_drive_to_algolia, 'interval', hours=1)
    scheduler.start()
    print("Background Sync Scheduler started (runs every 1 hour).")
