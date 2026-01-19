<p align="center">
  <img alt="Flask" src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white">
  <img alt="OpenAI" src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
</p>

# Expense Management Platform

AI-powered expense management system with role-based access control.

## Features

- User expense upload and tracking
- HR expense review and approval with notes
- AI-powered bill data extraction (OpenAI)
- JWT authentication with role-based access
- Analytics dashboard for HR

## Tech Stack

**Backend:** Flask, MongoDB, OpenAI API  
**Frontend:** React, TypeScript, Tailwind CSS, Vite

## Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB (Atlas or local)
- OpenAI API key

### Installation

1. **Backend:**
```bash
python3 -m venv myenv
source myenv/bin/activate
cd backend
pip install -r requirements.txt
```

2. **Frontend:**
```bash
cd frontend
npm install
```

3. **Environment Variables**

Create `.env` at project root:
```env
OPENAI_API_KEY=your_key
JWT_SECRET=your_secret
MONGO_URI=mongodb+srv://...
PORT=8000
```

### MongoDB Setup

**Option 1: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com](https://www.mongodb.com/cloud/atlas)
2. Create a cluster and database
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/expense_management`
4. Whitelist your IP address in Network Access
5. Add connection string to `MONGO_URI` in `.env`

**Option 2: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service: `mongod`
3. Use connection string: `mongodb://localhost:27017/expense_management`
4. Add to `MONGO_URI` in `.env`

The database will be created automatically on first run.

Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Run

**Backend:**
```bash
source myenv/bin/activate
cd backend
python app.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```


## API Endpoints

- `POST /auth/register` - Register user
- `POST /auth/login` - Login
- `POST /expenses/upload` - Upload bill
- `GET /expenses/my` - Get user expenses
- `GET /hr/expenses` - Get all expenses (HR)
- `PATCH /hr/expenses/:id/status` - Approve/reject with notes

## Roles

- **USER:** Upload expenses, view status and HR notes
- **HR:** Review, approve/reject with notes, view analytics
