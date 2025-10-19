# Full-Stack Development Startup Script
# Starts both Django backend and React frontend

Write-Host "🚀 Starting Candelaria Website Development Environment..." -ForegroundColor Green
Write-Host ""

# Start Django in a new window
Write-Host "📦 Starting Django Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; .\start_django.ps1"

# Wait a bit for Django to start
Start-Sleep -Seconds 3

# Start React in a new window
Write-Host "⚛️  Starting React Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Django Backend: http://localhost:8000/" -ForegroundColor Yellow
Write-Host "📊 Django Admin:   http://localhost:8000/admin/" -ForegroundColor Yellow
Write-Host "⚛️  React Frontend: http://localhost:5174/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Close those windows to stop the servers" -ForegroundColor Gray
