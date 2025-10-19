# 🔐 Bcrypt Password Security Update

## What Changed?

Updated the `Admin` model to use **bcrypt** for secure password hashing.

### Key Changes:

1. **Removed `salt` column** - Bcrypt stores salt within the hash itself
2. **Updated `password_hash` to 255 chars** - Bcrypt hashes are 60 chars, but 255 gives room
3. **Added `set_password()` method** - Securely hash passwords
4. **Updated `check_password()` method** - Verify passwords using bcrypt

---

## Understanding Salt in Bcrypt 🧂

### What is a Salt?

A salt is a random string added to passwords before hashing to prevent:

- **Rainbow table attacks** (pre-computed hash lookups)
- **Duplicate hashes** (two users with same password get different hashes)

### How Bcrypt Handles Salt:

**Bcrypt automatically generates and stores the salt IN the hash!**

Example bcrypt hash:

```
$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
│  │  │                   │
│  │  │                   └─ Actual hash (31 chars)
│  │  └───────────────────── Salt (22 chars) ← SALT IS HERE!
│  └──────────────────────── Work factor (12 = 2^12 iterations)
└─────────────────────────── Algorithm ($2b = bcrypt)
```

**You DON'T need a separate salt column!** ✨

---

## Database Migration Required

### Step 1: Update PostgreSQL Table

Run this SQL to remove the salt column:

```sql
-- Connect to your database
\c candelaria_db

-- Remove the salt column from admins table
ALTER TABLE admins DROP COLUMN IF EXISTS salt;

-- Update password_hash column length
ALTER TABLE admins ALTER COLUMN password_hash TYPE VARCHAR(255);
```

### Step 2: Or use Django migrations

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

---

## How to Use in Your Code

### Creating an Admin with Password:

```python
from api.models import Admin, Member

# Get or create a member
member = Member.objects.get(name="Juan David Bolivar")

# Create admin
admin = Admin(member=member, email="juan@candelaria.com")
admin.set_password("SecurePassword123!")  # ← Automatically hashes with bcrypt
admin.save()

print(admin.password_hash)
# Output: $2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
```

### Verifying Password (Login):

```python
# Login attempt
admin = Admin.objects.get(email="juan@candelaria.com")

if admin.check_password("SecurePassword123!"):
    print("✅ Login successful!")
else:
    print("❌ Wrong password!")
```

### In Django Shell:

```bash
python manage.py shell
```

```python
from api.models import Admin, Member

# Create admin
member = Member.objects.first()
admin = Admin(member=member, email="test@example.com")
admin.set_password("mypassword")
admin.save()

# Test password
print(admin.check_password("mypassword"))  # True
print(admin.check_password("wrongpass"))   # False
```

---

## Security Benefits of Bcrypt

✅ **Automatic Salt Generation** - Unique for each password  
✅ **Adaptive Hashing** - Slow by design (prevents brute force)  
✅ **Industry Standard** - Used by millions of applications  
✅ **Future-Proof** - Can increase work factor as computers get faster  
✅ **Built-in Salt Storage** - No need for separate salt column

### Work Factor (rounds):

```python
bcrypt.gensalt(rounds=12)  # Default: 12
# rounds=10: ~10ms per hash
# rounds=12: ~40ms per hash (recommended)
# rounds=14: ~160ms per hash
```

Higher rounds = more secure but slower. 12 is the sweet spot.

---

## Example: Complete Login Flow

```python
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models import Admin

@api_view(['POST'])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        admin = Admin.objects.get(email=email)

        if admin.check_password(password):
            return Response({
                'success': True,
                'message': 'Login successful',
                'admin': admin.to_dict()
            })
        else:
            return Response({
                'success': False,
                'message': 'Invalid password'
            }, status=401)

    except Admin.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Admin not found'
        }, status=404)
```

---

## Testing

```python
# Test in Django shell
from api.models import Admin, Member

# Create test admin
member = Member.objects.first()
admin = Admin(member=member, email="test@candelaria.com")
admin.set_password("TestPass123!")
admin.save()

# Verify the hash format
print(f"Hash: {admin.password_hash}")
print(f"Length: {len(admin.password_hash)}")  # Should be 60

# Test password verification
assert admin.check_password("TestPass123!") == True
assert admin.check_password("WrongPassword") == False

print("✅ All tests passed!")
```

---

## Summary

### Before (with salt column):

```python
salt = "random_string"
password_hash = "pbkdf2_hmac_hash"  # Separate salt storage
```

### After (bcrypt):

```python
password_hash = "$2b$12$salt_and_hash_combined"  # Salt included!
admin.set_password("password")  # Easy to use
admin.check_password("password")  # Easy to verify
```

**Much simpler and more secure!** 🔐✨

---

## Migration Checklist

- [ ] Install bcrypt: `pip install bcrypt`
- [ ] Update models.py (already done ✅)
- [ ] Update requirements.txt (already done ✅)
- [ ] Run SQL to drop salt column
- [ ] Update password_hash column to VARCHAR(255)
- [ ] Test creating an admin with `set_password()`
- [ ] Test verifying password with `check_password()`

**Your passwords are now secured with industry-standard bcrypt! 🎉**
