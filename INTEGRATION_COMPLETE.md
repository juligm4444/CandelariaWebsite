# 🎉 React + Django Integration Complete!

## ✅ What's Been Set Up:

### 1. **API Service Layer** (`src/services/api.js`)

- Axios configured to connect to Django backend
- API functions for all models (teams, members, publications, admins, social links)
- Language support built-in

### 2. **Team Component Updated** (`src/components/Team.jsx`)

- Now fetches data from Django backend
- Automatic language switching
- Loading and error states
- Real-time data updates

### 3. **MemberCard Component Updated** (`src/components/MemberCard.jsx`)

- Works with Django data structure
- Displays image_url, career, role, and charge
- Fixed width for better scrolling

### 4. **Axios Installed**

- HTTP client for making API requests

---

## 🚀 How to Run:

### Terminal 1: Django Backend

```bash
cd backend
python manage.py runserver
```

Backend will run on: **http://localhost:8000**

### Terminal 2: React Frontend

```bash
npm run dev
```

Frontend will run on: **http://localhost:5173**

---

## 📝 Next Steps - Add Data to Database:

### Option 1: Using Django Admin Panel

1. Go to http://localhost:8000/admin/
2. Login with your superuser credentials
3. Add teams and members manually

### Option 2: Using API (Postman/cURL)

#### Create a Team:

```bash
curl -X POST http://localhost:8000/api/teams/ \
  -H "Content-Type: application/json" \
  -d '{
    "name_en": "Committee",
    "name_es": "Comité"
  }'
```

#### Create a Member:

```bash
curl -X POST http://localhost:8000/api/members/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan David Bolivar",
    "career_en": "Electrical Engineer",
    "career_es": "Ingeniero Eléctrico",
    "role_en": "Executive Committee Leader",
    "role_es": "Líder del Comité Ejecutivo",
    "charge_en": "Team Leader",
    "charge_es": "Líder de Equipo",
    "image_url": "",
    "team": 1
  }'
```

### Option 3: Import from JSON (Recommended)

Create a management command to import your existing JSON data:

```bash
cd backend
python manage.py shell
```

Then in the Python shell:

```python
from api.models import Team, Member
import json

# Create teams
teams_data = {
    "committee": {"name_en": "Committee", "name_es": "Comité"},
    "logistics": {"name_en": "Logistics", "name_es": "Logística"},
    "hr": {"name_en": "Human Resources", "name_es": "Recursos Humanos"},
    # ... add more teams
}

for key, data in teams_data.items():
    Team.objects.get_or_create(
        name_en=data["name_en"],
        name_es=data["name_es"]
    )

# Verify
print(f"Teams created: {Team.objects.count()}")
```

---

## 🧪 Testing the Integration:

1. **Start both servers** (Django + React)

2. **Add at least one team and one member** via admin panel

3. **Visit your React app**: http://localhost:5173

4. **Navigate to the Team page** - You should see data from Django!

5. **Test language switching** - Data should update automatically

---

## 🔍 Debugging:

### If you see "Error" message:

- Check Django server is running: http://localhost:8000/api/
- Check browser console for error messages
- Verify CORS is enabled in Django settings

### If teams don't appear:

- Make sure you added data to the database
- Check Django API: http://localhost:8000/api/teams/
- Check browser Network tab for failed requests

### If language switching doesn't work:

- Django returns data based on `?lang=en` or `?lang=es` parameter
- Check API calls in Network tab include lang parameter

---

## 📊 API Endpoints You Can Use:

### Get all teams (English):

http://localhost:8000/api/teams/?lang=en

### Get team members (Spanish):

http://localhost:8000/api/teams/1/members/?lang=es

### Get all publications:

http://localhost:8000/api/publications/?lang=en

### Get members by team:

http://localhost:8000/api/members/?team=1&lang=es

---

## 🎯 What Works Now:

✅ React fetches data from Django backend  
✅ Multi-language support (EN/ES)  
✅ Team and member display with card scrolling  
✅ CORS properly configured  
✅ Loading and error states  
✅ Automatic language switching

---

## 🔜 What You Can Build Next:

1. **Publications Page** - Show team publications
2. **Admin Dashboard** - Let team leaders create posts
3. **Search/Filter** - Find members by name or team
4. **Member Profile Page** - Detailed view with social links
5. **Image Upload** - Allow uploading member photos

---

## 💡 Tips:

- Keep Django server running while developing
- Use Django admin panel for quick data entry
- Check browser console for any React errors
- Check Django terminal for API errors
- Use Django REST Framework's browsable API for testing

**Your full-stack application is now connected and ready! 🚀**
