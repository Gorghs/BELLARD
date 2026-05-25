# Project Context

## Project Name

Shadow Music

---

## Vision

Build a full-fledged high-quality personal music streaming platform inspired by Spotify.

This is NOT a demo application.

The application must feel production-grade with:
- smooth UI
- real-time search
- optimized playback
- persistent playlists
- responsive design
- immersive music-first experience
- desktop-grade audio experience
- FLAC streaming support
- advanced music library indexing

The system is designed for:
- personal/private usage
- around 5 users
- very large high-quality music libraries
- IEM/audiophile-grade listening

---

# Core Requirements

## Music Source

Music files are stored inside a public Google Drive folder.

Google Drive Folder:

https://drive.google.com/drive/folders/1oET1O1xshcUmDpubiaLGfI0vqQvCgmVU?usp=sharing

The app must dynamically fetch songs from this folder.

When new songs are added:
- they should automatically appear
- without manual frontend updates

The system should periodically sync the folder.

---

# Authentication

Authentication must use Firebase Authentication.

Supported:
- Google Login only

Requirements:
- persistent sessions
- protected routes
- user-specific playlists
- user-specific favorites
- recently played history

---

# Audio Quality

The application is focused on:
- FLAC
- WAV
- high bitrate audio
- audiophile playback

Requirements:
- no transcoding
- preserve original quality
- exact bitrate streaming

The app must support:
- FLAC playback in browser
- seek support
- queue playback
- gapless-ready architecture

---

# Search System

Search must be extremely advanced.

Use Meilisearch.

Search requirements:
- typo tolerance
- instant results
- fuzzy matching
- partial matching
- ranking
- filtering
- artist search
- album search
- genre search
- tag search
- mood search

Examples:
- "interstel" → Interstellar
- "zimmer calm" → Hans Zimmer calm songs

---

# Metadata

Metadata must be extracted automatically from audio files.

Use:
- mutagen (Python)

Extract:
- title
- artist
- album
- genre
- year
- duration
- bitrate
- sample rate
- embedded cover art
- tags

Fallback:
- filename parsing

---

# Playlists

Users must be able to:
- create playlists
- edit playlists
- delete playlists
- reorder songs
- favorite songs

Playlists are stored in Firestore.

---

# User Experience

The frontend MUST feel extremely close to Spotify.

UI Requirements:
- dark Spotify-inspired theme
- left sidebar
- sticky bottom music player
- smooth animations
- responsive design
- album hover effects
- playlist pages
- artist pages
- search page
- library page
- queue panel
- immersive music UI

The experience should feel polished and premium.
