# CandelariaWebsite - Start Here

## Quick Start

Windows:

```powershell
.\start_dev.ps1
```

macOS/Linux:

```bash
./start_dev.sh
```

## Local URLs

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Django Admin: http://localhost:8000/admin/

## Environment Files (Current Convention)

- Root `.env.local`: frontend (Vite) values
- `backend/.env`: backend (Django) values
- Root `.env.example`: single template for both sections

Notes:

- `backend/.env` and `.env.local` are local runtime files and should not be committed.
- Copy values from `.env.example` into the appropriate runtime file.

## Supabase

Supabase auth/migrations setup and CLI flow is documented in:

- `SUPABASE_SETUP.md`

Media migration commands:

```powershell
cd backend
python manage.py sync_media_to_supabase --dry-run
python manage.py sync_media_to_supabase
```

## Security and Hardening

Current protections include:

- API security headers middleware
- API content-type guard middleware
- Auth/burst throttling for sensitive endpoints
- Webhook signature verification and idempotency handling

Validation commands:

```powershell
cd backend
python manage.py check
python manage.py test api.tests.PaymentSecurityTests --keepdb
python manage.py test api.tests.TeamManagementPermissionsTests --keepdb
```

## Useful Commands

Frontend build:

```powershell
npm run build
```

Supabase migrations:

```powershell
npx supabase link --project-ref thlhtuktznnlvxytbapa
npx supabase db push
npx supabase migration list
```

## Reference Docs

- `SUPABASE_SETUP.md` - Supabase setup and migration flow
- `OPTIMIZATION_GUIDE.md` - optimization details
- `OPTIMIZATIONS_SUMMARY.md` - optimization results summary
