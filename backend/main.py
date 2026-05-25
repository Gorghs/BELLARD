import os
import json
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from api import audio
from core.scheduler import start_scheduler, sync_drive_to_algolia
from contextlib import asynccontextmanager

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield

app = FastAPI(title="Bellard API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio.router, prefix="/api/audio", tags=["audio"])

@app.get("/")
def read_root():
    return {"message": "Bellard API is running"}

@app.get("/api/songs")
def get_all_songs():
    """Return all songs from the local metadata cache."""
    cache_path = "cache/song_metadata.json"
    if os.path.exists(cache_path):
        with open(cache_path, 'r') as f:
            data = json.load(f)
            songs = list(data.values())
            # Strip internal tracking fields before returning
            for s in songs:
                s.pop('_modifiedTime', None)
            return songs
    return []

@app.get("/api/metadata/cache")
def get_metadata_cache():
    cache_path = "cache/song_metadata.json"
    if os.path.exists(cache_path):
        with open(cache_path, 'r') as f:
            data = json.load(f)
            return list(data.values())
    return []

@app.post("/api/songs/sync")
async def force_sync(background_tasks: BackgroundTasks):
    """Trigger an immediate Drive → cache → Algolia sync in the background."""
    background_tasks.add_task(sync_drive_to_algolia)
    return {"message": "Sync started in background"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
