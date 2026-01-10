# Database Setup Guide

## Prerequisites
- PostgreSQL installed and running
- PostgreSQL extension for VS Code (already configured)

## Setup Steps

### 1. Create Database
First, connect to your PostgreSQL server and create the database:

```sql
CREATE DATABASE candelaria_db;
```

### 2. Run Schema
Connect to `candelaria_db` and run the schema file:

**Using VS Code PostgreSQL Extension:**
1. Right-click on your connection → Add new connection
2. Set database name to `candelaria_db`
3. Right-click on `candelaria_db` → New Query
4. Copy and paste the contents of `schema.sql`
5. Execute the query

**Using Terminal:**
```bash
psql -U postgres -h localhost -p 5432 -d candelaria_db -f database/schema.sql
```

### 3. Insert Sample Data
Run the seed file to populate initial data:

**Using VS Code PostgreSQL Extension:**
1. Right-click on `candelaria_db` → New Query
2. Copy and paste the contents of `seed.sql`
3. Execute the query

**Using Terminal:**
```bash
psql -U postgres -h localhost -p 5432 -d candelaria_db -f database/seed.sql
```

## Database Structure

### Tables Created
- `teams` - Team information (Committee, Logistics, HR, Design, etc.)
- `members` - Team members with roles and descriptions
- `team_objectives` - Functions/objectives for each team
- `publications` - Research papers and articles
- `contact_submissions` - Contact form submissions
- `website_config` - Global website configuration

### Sample Queries

**Get all teams with their member count:**
```sql
SELECT 
    t.name_es as team_name,
    COUNT(m.id) as member_count
FROM teams t
LEFT JOIN members m ON t.id = m.team_id AND m.is_active = true
GROUP BY t.id, t.name_es, t.display_order
ORDER BY t.display_order;
```

**Get team objectives for display:**
```sql
SELECT 
    t.name_es as team_name,
    to.title_es,
    to.description_es
FROM teams t
LEFT JOIN team_objectives to ON t.id = to.team_id
WHERE t.name_key = 'Committee'
ORDER BY to.objective_order;
```

**Get featured publications:**
```sql
SELECT title, description, publication_date, author
FROM publications 
WHERE is_featured = true
ORDER BY publication_date DESC;
```

## Next Steps
1. Set up API endpoints in your backend to serve this data
2. Connect the React frontend to consume the API
3. Implement the contact form to save submissions to the database