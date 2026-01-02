# Backend API Documentation

Flask-based REST API for expense management with OpenAI bill extraction.

## Quick Start

### Installation

```bash
# From project root, create and activate myenv
cd /Users/anuj/Desktop/Automated_Bill_Extraction/Automated-Billing-Extraction
python3 -m venv myenv
source myenv/bin/activate

# Install dependencies
cd backend
pip install -r requirements.txt
```

### Configuration

The backend uses the root `.env` file at `/Users/anuj/Desktop/Automated_Bill_Extraction/.env`.

Make sure your root `.env` file contains:

```env
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
MONGO_URI=mongodb://localhost:27017/expense_management
PORT=8000
```

### Run

```bash
# Make sure myenv is activated
source ../myenv/bin/activate
python app.py
```

## API Endpoints

### Authentication

**Register User**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "USER"
}
```

**Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### User Expenses

**Upload Expense**
```http
POST /expenses/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

**Get My Expenses**
```http
GET /expenses/my
Authorization: Bearer <token>
```

**Get My Expenses (Filtered)**
```http
GET /expenses/my?status=pending
Authorization: Bearer <token>
```

**Download Excel Report**
```http
GET /expenses/download
Authorization: Bearer <token>
```

### HR Management

**Get All Expenses**
```http
GET /hr/expenses
Authorization: Bearer <hr_token>
```

**Filter Expenses**
```http
GET /hr/expenses?status=pending&user_id=<user_id>
Authorization: Bearer <hr_token>
```

**Update Expense Status**
```http
PATCH /hr/expenses/<expense_id>/status
Authorization: Bearer <hr_token>
Content-Type: application/json

{
  "status": "approved"
}
```

### Health Check

```http
GET /health
```

## Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message"
}
```

## Environment Variables

See main README.md for complete list.

## Deployment

See `DEPLOYMENT.md` for Railway deployment instructions.
