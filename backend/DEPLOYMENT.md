# Deployment Guide

## Railway Deployment

### Prerequisites
1. Railway account
2. MongoDB database (MongoDB Atlas or Railway MongoDB)
3. OpenAI API key

### Step 1: Prepare Repository
Ensure your `backend/` folder contains:
- `app.py`
- `requirements.txt`
- `Procfile`
- All source code files

### Step 2: Connect to Railway
1. Go to Railway dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

### Step 3: Configure Environment Variables
In Railway dashboard, add these environment variables:

**Required:**
```
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret-key-here
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

**Optional:**
```
PORT=8000
HOST=0.0.0.0
LOG_LEVEL=INFO
OPENAI_ENDPOINT=https://... (if using Azure OpenAI)
OPENAI_MODEL=gpt-4o
```

### Step 4: Deploy
Railway will automatically:
1. Detect the `Procfile`
2. Install dependencies from `requirements.txt`
3. Start the application with Gunicorn

### Step 5: Verify Deployment
1. Check Railway logs for startup messages
2. Test health endpoint: `https://your-app.railway.app/health`
3. Test authentication: `POST /auth/register`

## Local Development

### Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Variables
Create `.env` file:
```env
OPENAI_API_KEY=your_key
JWT_SECRET=your_secret
MONGO_URI=mongodb://localhost:27017/expense_management
PORT=8000
```

### Run
```bash
python app.py
```

## MongoDB Setup

### Local MongoDB
```bash
mongod
# Default: mongodb://localhost:27017
```

### MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Add to `MONGO_URI` environment variable

## Testing API Endpoints

### Register User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "role": "USER"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Upload Expense (with token)
```bash
curl -X POST http://localhost:8000/expenses/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@bill.jpg"
```

### Get My Expenses
```bash
curl -X GET http://localhost:8000/expenses/my \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### HR: Get All Expenses
```bash
curl -X GET http://localhost:8000/hr/expenses \
  -H "Authorization: Bearer HR_TOKEN"
```

### HR: Approve Expense
```bash
curl -X PATCH http://localhost:8000/hr/expenses/EXPENSE_ID/status \
  -H "Authorization: Bearer HR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

## Troubleshooting

### Import Errors
- Ensure you're running from the `backend/` directory
- Check that all `__init__.py` files exist

### MongoDB Connection Issues
- Verify `MONGO_URI` is correct
- Check MongoDB is running (local) or accessible (Atlas)
- Ensure network access is allowed (Atlas)

### OpenAI API Errors
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits
- For Azure, ensure `OPENAI_ENDPOINT` is set

### File Upload Issues
- Check `UPLOAD_FOLDER` directory exists
- Verify file size is within limits
- Check file extension is allowed

## Production Checklist

- [ ] All environment variables set
- [ ] MongoDB indexes created (automatic on startup)
- [ ] CORS configured for frontend domain
- [ ] File upload limits configured
- [ ] Logging level set to INFO or WARNING
- [ ] Health check endpoint working
- [ ] SSL/HTTPS enabled (Railway default)

