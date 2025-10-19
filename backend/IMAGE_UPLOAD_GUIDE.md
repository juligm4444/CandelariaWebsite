# 📸 Image Upload Guide

## 🎯 Three Ways to Add Member Images

### ✅ Option 1: Upload Local Image (Recommended)

1. **Go to Django Admin**: http://localhost:8000/admin/
2. **Click** "Members" → "Add member" (or edit existing member)
3. **Scroll down to the "Image" field**
4. **Click "Choose File"**
5. **Select an image from your computer**
   - Supported formats: JPG, PNG, GIF, WebP
   - Recommended size: 400x400 pixels (square)
   - Max size: 5MB
6. **Fill in other fields** and click "SAVE"
7. **Image is automatically uploaded!**

**Where images are stored:**
- `backend/media/members/` folder
- Django automatically creates this folder
- Images are served at: `http://localhost:8000/media/members/filename.jpg`

---

### 🌐 Option 2: Use External URL

If your image is already online (LinkedIn, GitHub, etc.):

1. **Right-click the image** → "Copy image address"
2. **Paste the URL** in the `image_url` field
3. **Leave the "Image" field empty**
4. **Save**

**Example URLs:**
```
https://avatars.githubusercontent.com/u/12345678
https://i.imgur.com/abc123.jpg
https://example.com/photos/john-doe.jpg
```

---

### 📁 Option 3: Copy Image to Media Folder

1. **Copy your image** to: `backend/media/members/`
2. **Rename it** (example: `john_doe.jpg`)
3. **In Admin**, put in image_url field:
   ```
   /media/members/john_doe.jpg
   ```
4. **Save**

---

## 🖼️ Image Best Practices

### Recommended Specs:
- **Format**: JPG or PNG
- **Dimensions**: 400x400 pixels (square)
- **File size**: Under 500KB
- **Aspect ratio**: 1:1 (square) for best results

### How to Resize Images:

**Windows:**
1. Right-click image → "Edit with Photos"
2. Click "Resize"
3. Choose "Define custom dimensions"
4. Set to 400 x 400 pixels
5. Save

**Online Tool:**
- https://www.iloveimg.com/resize-image
- Upload, set to 400x400, download

---

## 🔄 How It Works

The Member model has TWO image fields:

1. **`image`** - For uploading files (ImageField)
2. **`image_url`** - For external URLs (CharField)

**Priority:**
- If `image` is uploaded → uses uploaded file
- If `image` is empty → uses `image_url`
- If both empty → no image shown

---

## 🧪 Test It:

### Upload an Image:

1. Create a member with an uploaded image
2. Visit: http://localhost:5174/team
3. See the image appear in the member card!

### Check Image URL:

1. Look at the member card in admin
2. Click the image link
3. Should open: `http://localhost:8000/media/members/your-image.jpg`

---

## 📂 Folder Structure

```
backend/
├── media/                    ← Created automatically
│   └── members/              ← Member images here
│       ├── john_doe.jpg
│       ├── jane_smith.png
│       └── ...
├── api/
├── candelaria_project/
└── ...
```

---

## 🐛 Troubleshooting

### Image not showing in React:

**Check:**
1. Is Django serving media files?
   - Visit: `http://localhost:8000/media/members/` 
   - You should see your uploaded images listed

2. Is the image path correct?
   - In React, check browser console (F12)
   - Look for 404 errors on image URLs

3. Check CORS:
   - Make sure `backend/.env` has port 5174 in CORS_ALLOWED_ORIGINS

### "Upload a valid image" error:

- File is corrupted or wrong format
- Try converting to JPG or PNG first

### Image too large:

- Resize to 400x400 pixels
- Or compress at: https://tinypng.com/

---

## 💡 Pro Tips

1. **Use square images** - They look best in the circular profile cards
2. **Optimize before upload** - Smaller files = faster loading
3. **Use descriptive names** - `juan_bolivar.jpg` not `IMG_1234.jpg`
4. **Back up originals** - Keep high-res versions elsewhere

---

## 🔐 Security Notes

- Django validates that uploaded files are actual images
- Images are isolated in `media/members/` folder
- Only image formats are accepted (no executables)
- File size limits can be configured in settings

---

**Now go ahead and upload some team member photos! 📸**
