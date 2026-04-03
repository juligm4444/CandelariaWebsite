#!/bin/bash

# Full-Stack Development Startup Script for macOS/Linux
# Starts both Django backend and React frontend

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"

is_local_host() {
    local host="$1"
    case "$host" in
        localhost|127.0.0.1|::1) return 0 ;;
        *) return 1 ;;
    esac
}

load_backend_env() {
    local env_example="$PROJECT_ROOT/.env.example"
    local env_file="$BACKEND_DIR/.env"

    if [ ! -f "$env_file" ] && [ -f "$env_example" ]; then
        cp "$env_example" "$env_file"
        echo "Created backend/.env from root .env.example"
    fi

    if [ -f "$env_file" ]; then
        set -a
        # shellcheck disable=SC1090
        source "$env_file"
        set +a
    fi

    export DB_NAME="${DB_NAME:-candelaria_db}"
    export DB_USER="${DB_USER:-postgres}"
    export DB_PASSWORD="${DB_PASSWORD:-}"
    export DB_HOST="${DB_HOST:-localhost}"
    export DB_PORT="${DB_PORT:-5432}"

    if [ -n "${DATABASE_URL:-}" ]; then
        local parsed
        parsed="$(python3 - <<'PY'
import os
from urllib.parse import urlparse

u = os.environ.get('DATABASE_URL', '').strip()
if not u:
    print('')
else:
    p = urlparse(u)
    db = (p.path or '/').lstrip('/')
    print('|'.join([
        p.hostname or '',
        str(p.port or ''),
        p.username or '',
        p.password or '',
        db,
    ]))
PY
)"

        if [ -n "$parsed" ]; then
            IFS='|' read -r parsed_host parsed_port parsed_user parsed_pass parsed_name <<< "$parsed"
            [ -n "$parsed_host" ] && DB_HOST="$parsed_host"
            [ -n "$parsed_port" ] && DB_PORT="$parsed_port"
            [ -n "$parsed_user" ] && DB_USER="$parsed_user"
            [ -n "$parsed_pass" ] && DB_PASSWORD="$parsed_pass"
            [ -n "$parsed_name" ] && DB_NAME="$parsed_name"
            export DB_HOST DB_PORT DB_USER DB_PASSWORD DB_NAME
        fi
    fi
}

ensure_postgres_running() {
    if command -v pg_isready >/dev/null 2>&1; then
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
            return 0
        fi
    fi

    if command -v brew >/dev/null 2>&1; then
        local pg_service
        pg_service="$(brew services list 2>/dev/null | awk 'NR>1 && $1 ~ /^postgresql(@[0-9]+)?$/ {print $1; exit}')"
        if [ -n "$pg_service" ]; then
            echo "PostgreSQL not ready, starting Homebrew service: $pg_service"
            brew services start "$pg_service" >/dev/null 2>&1 || true
            sleep 3
        fi
    fi

    if command -v pg_isready >/dev/null 2>&1 && pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
        return 0
    fi

    echo "ERROR: PostgreSQL is not reachable at $DB_HOST:$DB_PORT."
    echo "   Start PostgreSQL and retry. On macOS (Homebrew), install/start with:"
    echo "   brew install postgresql@16"
    echo "   brew services start postgresql@16"
    return 1
}

run_psql() {
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$@"
}

ensure_database_exists() {
    if ! command -v psql >/dev/null 2>&1; then
        echo "ERROR: psql CLI was not found. Install PostgreSQL client tools and retry."
        return 1
    fi

    local exists
    exists="$(run_psql -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}';" 2>/dev/null || true)"

    if [ "$exists" != "1" ]; then
        echo "Creating database '$DB_NAME'..."
        run_psql -d postgres -c "CREATE DATABASE \"${DB_NAME}\";"
    else
        echo "Database '$DB_NAME' already exists."
    fi
}

echo "Starting Candelaria Website Development Environment..."
echo ""

# Check if we're in the right directory
cd "$PROJECT_ROOT"

if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

load_backend_env

echo "Verifying PostgreSQL connectivity..."
if is_local_host "$DB_HOST"; then
    ensure_postgres_running
    ensure_database_exists
else
    if command -v pg_isready >/dev/null 2>&1 && pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
        echo "Remote PostgreSQL is reachable at $DB_HOST:$DB_PORT"
    else
        echo "ERROR: Remote PostgreSQL is not reachable at $DB_HOST:$DB_PORT"
        echo "Check your Supabase credentials/network and retry."
        exit 1
    fi
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
fi

# Check if Django dependencies are installed
if [ ! -d "backend/venv" ] && [ ! -d "backend/env" ]; then
    echo "Setting up Python virtual environment..."
    cd "$BACKEND_DIR"
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd "$PROJECT_ROOT"
fi

echo "Starting Django Backend..."
# Start Django in background
cd "$BACKEND_DIR"
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "env" ]; then
    source env/bin/activate
fi

echo "Applying Django migrations..."
python manage.py migrate

# Start Django development server in background
python manage.py runserver 8000 &
DJANGO_PID=$!
cd "$PROJECT_ROOT"

echo "Waiting for Django to start..."
sleep 3

echo "Starting React Frontend..."
# Start React development server
npm run dev &
REACT_PID=$!

echo ""
echo "Both servers are now running!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes when script is interrupted
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $DJANGO_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    echo "Servers stopped."
    exit 0
}

# Set up signal trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for user to press Ctrl+C
wait