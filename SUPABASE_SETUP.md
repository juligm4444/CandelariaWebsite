# Supabase Setup And Migration Guide

This project uses two data paths:

- Django API database (backend/.env)
- Supabase Auth + Supabase SQL migrations (supabase/migrations)
- Supabase Storage for durable uploaded media

This guide covers the Supabase side for the dual-user registration model.

## Project Ref

- thlhtuktznnlvxytbapa

## One-Time Local Setup (CLI)

1. Install Supabase CLI (or use npx):
   npx supabase --version

2. Create a Personal Access Token in Supabase Dashboard:
   Dashboard > Account Settings > Access Tokens

3. Set token in PowerShell session:
   $env:SUPABASE_ACCESS_TOKEN = "your_personal_access_token"

4. Link this repository to the Supabase project:
   npx supabase link --project-ref thlhtuktznnlvxytbapa

## Apply Migrations

1. Push pending migrations:
   npx supabase db push

2. Verify migration state:
   npx supabase migration list

## Current Supabase Migration Files

- supabase/migrations/20260402_dual_user_support.sql
- supabase/migrations/20260402_registration_profile_sync.sql

They implement:

- whitelist-driven internal role assignment
- open signup for non-whitelisted users
- profiles upsert on auth signup (idempotent)
- whitelist-to-profile sync trigger for post-signup invitations

## Frontend Environment Variables (Vite)

Create a local env file from .env.example and set:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Backend Environment Variables (Django media storage)

Set these in the backend environment and in Vercel production env vars:

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_STORAGE_BUCKET

Recommended bucket setup:

- Create a public bucket named `media` or set `SUPABASE_STORAGE_BUCKET` to your bucket name.
- Store objects under these prefixes:
  - `members/`
  - `teams/`
  - `publications/`
  - `publications/files/`

Behavior:

- When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present, Django uses Supabase Storage as the default backend for `ImageField` and `FileField` uploads.
- Existing database paths are preserved, so current records continue working after the files are uploaded to the bucket.

## One-Time Media Migration

After configuring the backend env vars, upload the current local media files:

```powershell
cd backend
python manage.py sync_media_to_supabase
```

Useful options:

- `python manage.py sync_media_to_supabase --dry-run`
- `python manage.py sync_media_to_supabase --overwrite`

Note:

- This repo is Vite + React, not Next.js.
- Use VITE\_ prefixed variables for browser-side access.

## Frontend Supabase Integration

Implemented files:

- src/lib/supabaseClient.js
- src/hooks/useUserProfile.js
- src/components/PrivateRoute.jsx

Behavior:

- useUserProfile fetches profiles row for the authenticated Supabase user.
- internal-only routes accept either Django auth internal flag or Supabase profile internal flag.

## Security Notes

1. Never commit real tokens or passwords.
2. Rotate any token that was pasted into chat, screenshots, or terminal history.
3. Keep .env and .env.local values private.

## Useful Commands

- npx supabase migration list
- npx supabase db push
- npm run build
- cd backend ; python manage.py check

## Last Updated

- 2026-04-02
