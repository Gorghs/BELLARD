# System Architecture

# High-Level Architecture

                    ┌────────────────────┐
                    │   Google Drive     │
                    │  Music Storage     │
                    └─────────┬──────────┘
                              │
                     Folder Sync Service
                              │
                    ┌─────────▼──────────┐
                    │   FastAPI Backend  │
                    │                    │
                    │ Metadata Extraction│
                    │ Drive API Access   │
                    │ Sync Scheduler     │
                    └───────┬─────┬──────┘
                            │     │
                            │     │
                ┌───────────▼─┐ ┌─▼──────────┐
                │ Firestore   │ │Meilisearch │
                │             │ │             │
                │ playlists   │ │ song index  │
                │ users       │ │ fuzzy search│
                │ favorites   │ │ ranking     │
                └──────┬──────┘ └────┬────────┘
                       │             │
                       └──────┬──────┘
                              │
                    ┌─────────▼────────┐
                    │   Next.js App    │
                    │                  │
                    │ Spotify-like UI  │
                    │ Audio Player     │
                    │ Search Engine UI │
                    └─────────┬────────┘
                              │
                    ┌─────────▼────────┐
                    │ Firebase Auth    │
                    └──────────────────┘

---

# Frontend

- Next.js App Router
- TypeScript
- TailwindCSS
- Zustand
- Framer Motion

---

# Backend

- FastAPI
- Google Drive API
- Mutagen
- Meilisearch Integration

---

# Search Features

- typo tolerance
- fuzzy search
- instant results
- autocomplete
- ranking
- filtering

---

# Deployment

Frontend:
- Vercel

Backend:
- Railway

Search:
- Meilisearch Cloud
