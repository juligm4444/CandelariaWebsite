# ⚡ Quick Start Guide

## 🚀 One Command to Rule Them All

### Start Everything (Recommended)

```powershell
.\start_dev.ps1
```

This will:
- ✅ Activate Python virtual environment
- ✅ Start Django backend at http://localhost:8000/
- ✅ Start React frontend at http://localhost:5174/
- ✅ Open both servers in separate PowerShell windows

---

## 🔧 Individual Server Commands

### Start Django Only

```powershell
cd backend
.\start_django.ps1
```

### Start React Only

```powershell
npm run dev
```

---

## 🌐 Access Your Application

| Service | URL | Purpose |
|---------|-----|---------|
| **React Frontend** | http://localhost:5174/ | Main website |
| **React Teams Page** | http://localhost:5174/team | View teams and members |
| **Django Admin** | http://localhost:8000/admin/ | Manage data |
| **Django API** | http://localhost:8000/api/ | REST API endpoints |

---

## 👤 Login Credentials

You already created a superuser. Use those credentials to login at:
http://localhost:8000/admin/

---

## 📝 Create Your First Team

1. **Start the servers**:
   ```powershell
   .\start_dev.ps1
   ```

2. **Go to Django Admin**:
   http://localhost:8000/admin/

3. **Login** with your superuser credentials

4. **Create a Team**:
   - Click "Teams" → "+ Add team"
   - Fill in:
     - `name_en`: "Executive Committee" (or any name in English)
     - `name_es`: "Comité Ejecutivo" (or any name in Spanish)
   - Click "SAVE"

5. **Create a Member**:
   - Click "Members" → "+ Add member"
   - Fill in all fields:
     - `name`: Full name
     - `career_en`: Career in English (e.g., "Electrical Engineer")
     - `career_es`: Career in Spanish (e.g., "Ingeniero Eléctrico")
     - `role_en`: Role in English (e.g., "Team Leader")
     - `role_es`: Role in Spanish (e.g., "Líder de Equipo")
     - `charge_en`: Position in English (e.g., "Executive Director")
     - `charge_es`: Position in Spanish (e.g., "Director Ejecutivo")
     - `image_url`: URL or path to profile image (optional)
     - `team`: Select the team you just created
   - Click "SAVE"

6. **View in React**:
   - Go to http://localhost:5174/team
   - Your team and members will appear! 🎉
   - Try the language toggle to see Spanish/English switch

---

## 🛑 Stop the Servers

Simply close the PowerShell windows or press `CTRL+C` in each terminal.

---

## 🔍 Troubleshooting

### "Port already in use"

If you get a port error:

**For Django (port 8000)**:
```powershell
# Kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

**For React (port 5174)**:
```powershell
# Kill the process using port 5174
netstat -ano | findstr :5174
taskkill /PID <PID_NUMBER> /F
```

### "Module not found" or "Django not installed"

Make sure the virtual environment is activated:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
```

You should see `(venv)` at the beginning of your prompt.

### Database connection error

Check `backend/.env` file has correct PostgreSQL credentials:
```
DB_NAME=candelaria_db
DB_USER=postgres
DB_PASSWORD=44$WwitdtstL$44
DB_HOST=localhost
DB_PORT=5432
```

---

## 📖 More Documentation

- **START_HERE.md** - Complete setup guide
- **INTEGRATION_COMPLETE.md** - Frontend-Backend integration details
- **backend/README.md** - Django API documentation
- **backend/BCRYPT_SECURITY.md** - Password security guide

---

## 💡 Pro Tips

1. **Keep servers running while developing** - They'll auto-reload on file changes
2. **Use Django Admin for data management** - It's the easiest way
3. **Check browser console (F12)** - See API calls and errors
4. **Test both languages** - Use the language toggle in navbar

---

## 🎯 Next Steps

- [ ] Add your team members via Django Admin
- [ ] Customize the styling in React components
- [ ] Add team photos (update `image_url` in Member model)
- [ ] Create publications for your teams
- [ ] Add social media links for members

---

**You're all set! Happy coding! 🚀**
