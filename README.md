# Bellard Music Platform

A modern, full-stack music streaming platform. It streams audio directly from Google Drive, uses Firebase for authentication and user data, and provides lightning-fast search via Algolia.

## How to Start

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Fill in your keys
uvicorn main:app --reload --port 8000
```

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
cp .env.example .env.local  # Fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.
