#!/bin/bash

# Full-Stack Development Startup Script for macOS/Linux
# Starts both Django backend and React frontend

echo "🚀 Starting Candelaria Website Development Environment..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Check if Django dependencies are installed
if [ ! -d "backend/venv" ] && [ ! -d "backend/env" ]; then
    echo "🐍 Setting up Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

echo "🔧 Starting Django Backend..."
# Start Django in background
cd backend
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "env" ]; then
    source env/bin/activate
fi

# Start Django development server in background
python manage.py runserver 8000 &
DJANGO_PID=$!
cd ..

echo "⏳ Waiting for Django to start..."
sleep 3

echo "⚛️  Starting React Frontend..."
# Start React development server
npm run dev &
REACT_PID=$!

echo ""
echo "✅ Both servers are now running!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes when script is interrupted
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $DJANGO_PID 2>/dev/null
    kill $REACT_PID 2>/dev/null
    echo "✅ Servers stopped."
    exit 0
}

# Set up signal trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for user to press Ctrl+C
wait