# Django Startup Script for Candelaria Website
# Starts Django with a deterministic Python executable to avoid activation policy issues.

Set-Location $PSScriptRoot

$pythonExe = Join-Path $PSScriptRoot 'venv\Scripts\python.exe'
if (-not (Test-Path $pythonExe)) {
  $pythonExe = 'python'
  Write-Host "Virtual environment python not found. Falling back to system python." -ForegroundColor Yellow
}

Write-Host "Applying database migrations..." -ForegroundColor Cyan
& $pythonExe manage.py migrate
if ($LASTEXITCODE -ne 0) {
  Write-Host "Migration failed. Django server was not started." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "Starting Django development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Django server at: http://localhost:8000/" -ForegroundColor Yellow
Write-Host "Admin panel at:   http://localhost:8000/admin/" -ForegroundColor Yellow
Write-Host "API at:           http://localhost:8000/api/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press CTRL+C to stop the server" -ForegroundColor Gray
Write-Host ""

& $pythonExe manage.py runserver

Write-Host ""
Write-Host "Django server stopped." -ForegroundColor Yellow
