# Django Startup Script for Candelaria Website
# This script activates the virtual environment and starts the Django server

# Change to the backend directory
Set-Location $PSScriptRoot

Write-Host "Activating Python virtual environment..." -ForegroundColor Cyan

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

Write-Host "Starting Django development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Django server at: http://localhost:8000/" -ForegroundColor Yellow
Write-Host "Admin panel at:   http://localhost:8000/admin/" -ForegroundColor Yellow
Write-Host "API at:           http://localhost:8000/api/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start Django server
python manage.py runserver

Write-Host ""
Write-Host "Django server stopped." -ForegroundColor Yellow
