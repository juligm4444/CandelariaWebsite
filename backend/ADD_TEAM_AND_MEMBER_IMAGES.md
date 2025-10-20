# 📸 Add Image Upload Columns to Database

## 🎯 Quick SQL Fix - Add Images to Teams and Members

Since you already have tables in your database, we need to add the `image` columns manually.

---

## 🔧 Step 1: Run SQL in pgAdmin

### Open pgAdmin:

1. **Open pgAdmin**
2. Connect to your **candelaria_db** database
3. Click **Tools** → **Query Tool**
4. **Copy and paste the SQL below**
5. Click the **Execute** button (▶️ or F5)

---

### SQL to Add Image Columns:

```sql
-- Add image columns to teams table
ALTER TABLE teams
ADD COLUMN image_url VARCHAR(300) NULL;

ALTER TABLE teams
ADD COLUMN image VARCHAR(100) NULL;

-- Add image column to members table (if not already added)
ALTER TABLE members
ADD COLUMN image VARCHAR(100) NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name IN ('teams', 'members')
ORDER BY table_name, ordinal_position;
```

---

## ✅ Step 2: Verify in Django Admin

After running the SQL:

1. **Refresh your browser** at http://localhost:8000/admin/
2. **Click "Teams"** → You should now see **"Image"** and **"Image url"** fields
3. **Click "Members"** → Same fields available there too!

---

## 📸 Step 3: Upload Team Images

### For Each Team:

1. Go to **Teams** in Django Admin
2. Click on a team or **"+ Add team"**
3. Fill in:
   - `name_en`: Team name in English
   - `name_es`: Team name in Spanish
   - **`image_url`**: Paste URL from Imgur/ImgBB OR
   - **`image`**: Click "Choose File" to upload from computer
4. Click **"SAVE"**

### Recommended Team Image Specs:

- **Format**: JPG or PNG
- **Dimensions**: 800x400 pixels (landscape/banner style)
- **File size**: Under 1MB
- **Aspect ratio**: 2:1 (wide banner)

---

## 📸 Step 4: Upload Member Images

Same process for members:

1. Go to **Members** in Django Admin
2. Upload images using either:
   - `image_url` field (external URL)
   - `image` field (upload file)

### Recommended Member Image Specs:

- **Format**: JPG or PNG
- **Dimensions**: 400x400 pixels (square)
- **File size**: Under 500KB
- **Aspect ratio**: 1:1 (square for profile photos)

---

## 🖼️ Quick Image Upload Options

### Option 1: Use Free Image Hosts

- **Imgur**: https://imgur.com/ (no account needed)
- **ImgBB**: https://imgbb.com/
- Upload → Copy image URL → Paste in `image_url` field

### Option 2: Upload Directly

- Click "Choose File" in the `image` field
- Select from your computer
- Django automatically saves to `backend/media/teams/` or `backend/media/members/`

---

## 🔍 Troubleshooting

### Can't see image fields in admin?

Django server might need restart:

1. Close the Django PowerShell window
2. Run `.\start_dev.ps1` again

### SQL Error "column already exists"?

The column is already there! Skip that specific ALTER TABLE command.

### Images not showing?

Make sure Django is serving media files (already configured in your settings).

---

## 📂 Where Images Are Stored

```
backend/
├── media/              ← Created automatically
│   ├── teams/          ← Team images here
│   │   ├── logo1.png
│   │   └── logo2.jpg
│   └── members/        ← Member images here
│       ├── john.jpg
│       └── jane.png
```

---

## 🎯 You're All Set!

Now both **Teams** and **Members** can have images uploaded! 🚀

**Next Steps:**

1. Run the SQL above in pgAdmin
2. Refresh Django Admin
3. Start uploading images for your teams and members!
