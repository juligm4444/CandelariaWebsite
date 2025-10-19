# Add Image Upload Column to Members Table

## Quick SQL Fix

Since you already have tables in your database, we need to add the `image` column manually.

### Run this SQL in pgAdmin or PostgreSQL:

```sql
-- Add image column to members table
ALTER TABLE members 
ADD COLUMN image VARCHAR(100) NULL;
```

### How to Run:

#### Option 1: Using pgAdmin (Easiest)

1. Open **pgAdmin**
2. Connect to your **candelaria_db** database
3. Click **Tools** → **Query Tool**
4. Paste the SQL above
5. Click the **Execute** button (▶️ or F5)
6. Done! ✅

#### Option 2: Using psql Command Line

```powershell
psql -U postgres -d candelaria_db
```

Then paste:
```sql
ALTER TABLE members ADD COLUMN image VARCHAR(100) NULL;
```

Type `\q` to exit.

---

## After Running the SQL:

### 1. Delete the bad migration file:

Delete this file:
```
backend/api/migrations/0001_initial.py
```

### 2. Mark migrations as fake (since tables exist):

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python manage.py migrate --fake api
```

### 3. Restart Django:

```powershell
.\venv\Scripts\Activate.ps1
python manage.py runserver
```

---

## Then You Can Upload Images!

Go to: http://localhost:8000/admin/api/member/add/

You'll see:
- **Image URL** field (for external URLs)
- **Image** field (for uploading files) ✨

---

## Alternative: Keep Using image_url Only

If you don't want to run SQL, you can just use the `image_url` field that already exists!

**Simply:**
1. Upload image to https://imgur.com/ or https://imgbb.com/
2. Copy the image URL
3. Paste in `image_url` field in Django admin
4. Save

**No database changes needed!**

---

Choose whichever method is easier for you! 🚀
