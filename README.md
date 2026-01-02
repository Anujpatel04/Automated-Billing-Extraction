# Expense Management Platform

AI-powered expense management system with role-based access control.

## Quick Start

### Backend

```bash
source myenv/bin/activate
cd backend
python app.py
```

Backend: http://localhost:8000

### Frontend

```bash
cd frontend
npm run dev
```

Frontend: http://localhost:3000

## First Time Setup

### 1. Backend

```bash
# Create virtual environment (if not exists)
python3 -m venv myenv
source myenv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
```

### 2. Frontend

```bash
cd frontend
npm install
```

### 3. Environment Variables

**Root `.env`** (`/Users/anuj/Desktop/Automated_Bill_Extraction/.env`):
```env
OPENAI_API_KEY=your_key
JWT_SECRET=your_secret
MONGO_URI=your_mongodb_uri
PORT=8000
```

**Frontend `.env`** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:8000
```

## Project Structure

```
Automated-Billing-Extraction/
├── backend/          # Flask API
├── frontend/         # React app
├── myenv/           # Virtual environment
└── README.md
```

## Features

- User expense upload and tracking
- HR expense review and approval
- AI-powered bill extraction
- JWT authentication
- MongoDB database

## Tech Stack

- Backend: Flask, MongoDB, OpenAI
- Frontend: React, TypeScript, Tailwind CSS
