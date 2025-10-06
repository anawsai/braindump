# BrainDump

A mobile note-taking app to help clear your thoughts!

# Tech Stack

| Layer | Tool | Purpose |
|-------|------|----------|
| Frontend | React Native (Expo) | Mobile UI |
| Backend | Flask (Python) | REST API |
| Database | Supabase (Postgres) | Notes storage |
| Auth | Supabase Auth | User login |

---
## Environment Variables

### Frontend (`frontend/.env.example`)
Safe to share, these are public keys.

### Backend (`backend/flask/.env.example`)
Keep the service role key private (never commit the real `.env`)!!!!!

## Prerequisites

Make sure you have installed on your computer:

- Node.js: https://nodejs.org/en
- Python: https://www.python.org/

## Local Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/anawsai/braindump.git
cd braindump
```

## Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npx expo start
```

## Backend Setup
```bash
cd backend/flask
python -m venv .venv
# mac/linux:
source .venv/bin/activate
# windows:
.venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env
python app.py
```
Runs at: http://localhost:5001/
