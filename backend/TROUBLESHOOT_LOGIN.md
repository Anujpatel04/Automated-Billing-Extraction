# Troubleshoot Login Issues

## Quick Diagnostic Steps

### 1. Check Database Connection

```bash
source myenv/bin/activate
cd backend
python test_db_connection.py
```

**Expected output:**
- ✓ MongoDB connection successful!
- ✓ Found X users in database

### 2. Check Backend is Running

```bash
curl http://localhost:8000/health
```

**Expected:** `{"success": true, "message": "Service is healthy", "status": "ok"}`

### 3. Test Login API Directly

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your_email@example.com","password":"YourPassword123"}'
```

**Check response:**
- Success: `{"success": true, "data": {"token": "...", "user": {...}}}`
- Failure: `{"success": false, "message": "..."}`

### 4. Check Backend Logs

```bash
tail -f backend/logs/app.log
```

**Look for:**
- "Login request received for: [email]"
- "User found: [email]"
- Any error messages

### 5. Verify User Exists

If login says "Invalid email or password":
1. Make sure user is registered
2. Check email is correct (case-insensitive)
3. Verify password matches

### 6. Common Issues

**"Invalid email or password"**
- User doesn't exist → Register first
- Wrong password → Check password
- Email typo → Verify email

**"Login failed: [error]"**
- Database connection issue → Run `test_db_connection.py`
- JWT_SECRET missing → Check `.env` file
- Check backend logs for details

**Network Error**
- Backend not running → Start with `python app.py`
- Wrong API URL → Check `frontend/.env` has `VITE_API_BASE_URL=http://localhost:8000`
- CORS issue → Check backend CORS settings

**Frontend shows error but backend works**
- Check browser console (F12)
- Check Network tab for API call
- Verify `VITE_API_BASE_URL` in `frontend/.env`

## Test Complete Flow

1. **Register a user:**
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","role":"USER"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

3. **Use token:**
```bash
curl http://localhost:8000/expenses/my \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

