# Expense Management Platform

Production-ready expense management system with AI-powered bill extraction, role-based access control, and modern web interface.

## Overview

A full-stack application that enables employees to upload expense bills and HR teams to review and manage expenses. The system uses OpenAI Vision API to automatically extract structured data from bill images.

## Features

- **User Features:**
  - Upload expense bills (images, PDFs)
  - AI-powered automatic data extraction
  - View expense history and status
  - Download expense reports as Excel

- **HR Features:**
  - Review all employee expenses
  - Approve or reject expense submissions
  - View analytics and statistics
  - Filter and search expenses

- **Technical Features:**
  - JWT-based authentication
  - Role-based access control (USER/HR)
  - MongoDB database
  - OpenAI Vision API for OCR
  - Modern React frontend
  - RESTful API architecture

## Tech Stack

### Backend
- Flask (Python)
- MongoDB
- JWT authentication
- OpenAI API (Vision + GPT-4o)
- Gunicorn (production)

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- React Query
- Axios

## Project Structure

```
Automated-Billing-Extraction/
├── backend/              # Flask backend API
│   ├── app.py           # Main application
│   ├── config.py        # Configuration
│   ├── requirements.txt # Dependencies
│   ├── auth/           # Authentication module
│   ├── expenses/        # Expense management
│   ├── hr/              # HR management
│   ├── ai/              # AI bill extraction
│   ├── storage/         # File management
│   └── utils/           # Utilities
│
├── frontend/            # React frontend
│   ├── src/
│   │   ├── api/        # API clients
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── hooks/      # React hooks
│   │   └── utils/      # Utilities
│   └── package.json
│
└── README.md           # This file
```

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (local or Atlas)
- OpenAI API key

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://localhost:27017/expense_management
PORT=8000
```

Run backend:
```bash
python app.py
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Run frontend:
```bash
npm run dev
```

### Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Configuration

### Backend Environment Variables

**Required:**
- `OPENAI_API_KEY` - OpenAI API key
- `JWT_SECRET` - Secret for JWT tokens
- `MONGO_URI` - MongoDB connection string

**Optional:**
- `PORT` - Server port (default: 8000)
- `HOST` - Server host (default: 0.0.0.0)
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint (if using Azure)
- `OPENAI_MODEL` - Model name (default: gpt-4o)

### Frontend Environment Variables

- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:8000)

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login

### User Expenses
- `POST /expenses/upload` - Upload bill image
- `GET /expenses/my` - Get user's expenses
- `GET /expenses/download` - Download Excel report

### HR Management
- `GET /hr/expenses` - Get all expenses
- `PATCH /hr/expenses/:id/status` - Approve/reject expense

### Health
- `GET /health` - Health check

## Deployment

### Railway Deployment

1. Connect repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy backend from `backend/` directory
4. Deploy frontend from `frontend/` directory (or use static hosting)

See `backend/DEPLOYMENT.md` for detailed deployment instructions.

## Development

### Backend
```bash
cd backend
source venv/bin/activate
python app.py
```

### Frontend
```bash
cd frontend
npm run dev
```

### Production Build
```bash
# Backend
gunicorn app:app --bind 0.0.0.0:8000

# Frontend
npm run build
```

## License

MIT License
