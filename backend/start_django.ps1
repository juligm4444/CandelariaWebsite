# Django Startup Script for Candelaria Website
# This script activates the virtual environment and starts the Django server

Write-Host "🚀 Starting Django Backend..." -ForegroundColor Green

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

# Start Django development server
Write-Host "✅ Virtual environment activated" -ForegroundColor Green
Write-Host "🌐 Starting Django server at http://localhost:8000/" -ForegroundColor Cyan
Write-Host "📊 Admin panel at http://localhost:8000/admin/" -ForegroundColor Cyan
Write-Host "🔌 API at http://localhost:8000/api/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Yellow
Write-Host ""

python manage.py runserver
