from algoliasearch.search_client import SearchClient
from core.config import settings

def get_algolia_client():
    if not settings.ALGOLIA_APP_ID or not settings.ALGOLIA_WRITE_KEY:
        print("Warning: ALGOLIA_APP_ID or ALGOLIA_WRITE_KEY is missing.")
        return None
    return SearchClient.create(settings.ALGOLIA_APP_ID, settings.ALGOLIA_WRITE_KEY)

def index_songs(songs: list):
    """
    Indexes the list of extracted song metadata into Algolia.
    """
    client = get_algolia_client()
    if not client:
        return

    try:
        index = client.init_index('songs')
        # Algolia requires each record to have an objectID
        for song in songs:
            if 'id' in song:
                song['objectID'] = song['id']
                
        # Clear existing records (optional, depending on sync strategy)
        # index.clear_objects()
        
        # Save objects
        index.save_objects(songs)
        
        # Set searchable attributes and custom ranking
        index.set_settings({
            'searchableAttributes': [
                'title',
                'artist',
                'album'
            ],
            'customRanking': [
                'asc(title)'
            ]
        })
        print(f"Successfully indexed {len(songs)} songs into Algolia.")
    except Exception as e:
        print(f"Failed to index songs in Algolia: {e}")

def delete_songs(song_ids: list):
    """
    Deletes the list of song IDs from Algolia.
    """
    if not song_ids: return
    client = get_algolia_client()
    if not client: return
    
    try:
        index = client.init_index('songs')
        index.delete_objects(song_ids)
        print(f"Successfully deleted {len(song_ids)} songs from Algolia.")
    except Exception as e:
        print(f"Failed to delete songs in Algolia: {e}")
