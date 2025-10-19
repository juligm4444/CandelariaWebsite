# Candelaria Django Backend

Backend API for the Candelaria Solar Car project website, built with Django and Django REST Framework.

## Features

- RESTful API for managing teams, members, admins, publications, and social links
- PostgreSQL database integration
- Multi-language support (English and Spanish)
- CORS enabled for React frontend
- Admin panel for data management

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with your PostgreSQL credentials:

```bash
cp .env.example .env
```

Edit `.env` file:

```
DB_NAME=candelaria_db
DB_USER=postgres
DB_PASSWORD=your_actual_password
DB_HOST=localhost
DB_PORT=5432
```

### 3. Run Migrations

**Important**: Since your PostgreSQL database already has tables created, Django needs to know about them.

```bash
# This will detect the existing tables
python manage.py migrate --fake-initial
```

### 4. Create a Superuser (for Django Admin)

```bash
python manage.py createsuperuser
```

### 5. Run the Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Teams

- `GET /api/teams/` - List all teams
- `GET /api/teams/{id}/` - Get team details
- `GET /api/teams/{id}/members/` - Get all members of a team
- `POST /api/teams/` - Create new team
- `PUT /api/teams/{id}/` - Update team
- `DELETE /api/teams/{id}/` - Delete team

### Members

- `GET /api/members/` - List all members
- `GET /api/members/?lang=en` - List members in English
- `GET /api/members/?lang=es` - List members in Spanish
- `GET /api/members/?team=1` - Filter members by team
- `GET /api/members/{id}/` - Get member details
- `GET /api/members/{id}/social-links/` - Get member's social links
- `POST /api/members/` - Create new member
- `PUT /api/members/{id}/` - Update member
- `DELETE /api/members/{id}/` - Delete member

### Publications

- `GET /api/publications/` - List all publications
- `GET /api/publications/?lang=en` - List publications in English
- `GET /api/publications/?lang=es` - List publications in Spanish
- `GET /api/publications/?team=1` - Filter by team
- `GET /api/publications/{id}/` - Get publication details
- `POST /api/publications/` - Create new publication
- `PUT /api/publications/{id}/` - Update publication
- `DELETE /api/publications/{id}/` - Delete publication

### Admins

- `GET /api/admins/` - List all admins
- `GET /api/admins/{id}/` - Get admin details
- `POST /api/admins/` - Create new admin
- `PUT /api/admins/{id}/` - Update admin
- `DELETE /api/admins/{id}/` - Delete admin

### Social Links

- `GET /api/social-links/` - List all social links
- `GET /api/social-links/?member=1` - Filter by member
- `GET /api/social-links/{id}/` - Get social link details
- `POST /api/social-links/` - Create new social link
- `PUT /api/social-links/{id}/` - Update social link
- `DELETE /api/social-links/{id}/` - Delete social link

## Database Models

### Team

- `name_en` (string): Team name in English
- `name_es` (string): Team name in Spanish

### Member

- `name` (string): Member's full name
- `career_en` / `career_es` (string): Career/degree in both languages
- `role_en` / `role_es` (string): Role in both languages
- `charge_en` / `charge_es` (string): Position/charge in both languages
- `image_url` (string, optional): URL to member's image
- `team` (FK): Reference to Team

### Admin

- `member` (OneToOne): Reference to Member
- `email` (string): Admin email address
- `salt` (string): Password salt
- `password_hash` (string): Hashed password

### Publication

- `title_en` / `title_es` (string): Title in both languages
- `content_en` / `content_es` (text): Content in both languages
- `publication_date` (date): Publication date
- `image_url` (string, optional): URL to publication image
- `team` (FK, optional): Reference to Team

### RedSocial

- `link` (string): Social media link URL
- `icon_url` (string): URL to social media icon
- `member` (FK): Reference to Member

## Django Admin

Access the Django admin panel at `http://localhost:8000/admin/`

Use the superuser credentials you created to login and manage data through a user-friendly interface.

## Testing the API

You can test the API using:

1. **Browser**: Navigate to `http://localhost:8000/api/`
2. **Postman**: Import the endpoints listed above
3. **cURL**:
   ```bash
   curl http://localhost:8000/api/teams/
   curl http://localhost:8000/api/members/?lang=es
   ```

## Connecting to React Frontend

In your React app, use axios or fetch to connect:

```javascript
// Example in React
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Get all teams
const teams = await axios.get(`${API_BASE_URL}/teams/`);

// Get members in Spanish
const members = await axios.get(`${API_BASE_URL}/members/?lang=es`);

// Get publications for a specific team
const publications = await axios.get(`${API_BASE_URL}/publications/?team=1&lang=en`);
```

## Project Structure

```
backend/
├── api/                    # Main Django app
│   ├── models.py          # Database models
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # API views
│   ├── urls.py            # API URL routing
│   └── admin.py           # Django admin configuration
├── candelaria_project/    # Django project settings
│   ├── settings.py        # Project settings
│   ├── urls.py            # Main URL configuration
│   └── wsgi.py            # WSGI application
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## Notes

- The models use `db_table` to match your existing PostgreSQL schema
- No `created_at` or `updated_at` fields are included as per your requirements
- CORS is configured to allow requests from your React frontend (port 5173)
- All models include `to_dict()` methods for easy JSON serialization with language support
