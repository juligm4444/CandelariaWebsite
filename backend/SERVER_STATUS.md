# 🚀 Backend Server Status - RUNNING ✅

## Server Information
- **Status:** Running
- **PID:** 28888, 28811
- **URL:** http://localhost:8000
- **Started:** March 26, 2026

## Available Endpoints

### 🔐 Authentication
- **Login:** POST http://localhost:8000/api/auth/login/
- **Register:** POST http://localhost:8000/api/auth/register/
- **Logout:** POST http://localhost:8000/api/auth/logout/
- **Refresh Token:** POST http://localhost:8000/api/auth/token/refresh/

### 📊 API Endpoints
- **Teams:** http://localhost:8000/api/teams/
- **Members:** http://localhost:8000/api/members/
- **Publications:** http://localhost:8000/api/publications/

### 🔧 Admin Panel
- **Django Admin:** http://localhost:8000/admin/
  - Username: `juligm4`
  - Password: `44$admin$44`

## ✅ Login Test Results

Successfully tested login with your credentials:
```json
{
  "message": "Login successful",
  "member": {
    "id": 8,
    "name": "Julián Galindo",
    "team": "Design",
    "role": "Team Leader",
    "is_team_leader": true
  },
  "tokens": {
    "access": "[JWT Token Generated]",
    "refresh": "[JWT Token Generated]"
  }
}
```

## 🌐 Frontend Access

Your website login page: http://localhost:5173/login

Use these credentials:
- **Email:** j.galindom2@uniandes.edu.co
- **Password:** 44$admin$44

## 🛑 Stop Backend Server

To stop the backend server:
```bash
lsof -ti:8000 | xargs kill -9
```

## 🔄 Restart Backend Server

To restart the backend server:
```bash
cd /Users/juliangalindomora/Documents/Candelaria/CandelariaWebsite/backend
nohup ./venv/bin/python manage.py runserver > /tmp/django.log 2>&1 &
```

## 📝 Server Logs

View real-time logs:
```bash
tail -f /tmp/django.log
```

---

**Everything is working correctly! You can now:**
1. ✅ Access Django Admin at http://localhost:8000/admin
2. ✅ Login to your website at http://localhost:5173/login
3. ✅ Make API calls to http://localhost:8000/api/*
