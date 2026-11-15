# AI Recruiter - Local Development Environment Launcher
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  AI Recruiter - Automated Local Startup Script" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check or Copy .env
if (-not (Test-Path ".env")) {
    Write-Host "[1/4] Generating .env configuration from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "[1/4] .env configuration verified." -ForegroundColor Green
}

# 2. Generate Master PDF Resume if missing
$resumePath = "backend/uploads/resumes/Adam_Blansett_Master_Resume.pdf"
if (-not (Test-Path $resumePath)) {
    Write-Host "[2/4] Generating Adam Blansett Master PDF Resume..." -ForegroundColor Yellow
    python scripts/generate_master_resume.py $resumePath
} else {
    Write-Host "[2/4] Master PDF Resume verified at: $resumePath" -ForegroundColor Green
}

# 3. Check Docker Status
Write-Host "[3/4] Checking Docker daemon status..." -ForegroundColor Yellow
$dockerReady = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerReady = $true
    }
} catch {
    $dockerReady = $false
}

if ($dockerReady) {
    Write-Host "Docker daemon is active. Starting complete AI Recruiter stack..." -ForegroundColor Green
    docker compose up -d --build
    Write-Host ""
    Write-Host "All services started successfully:" -ForegroundColor Green
    Write-Host "  - React Dashboard:  http://localhost:5173 (or http://localhost:3000)" -ForegroundColor Cyan
    Write-Host "  - FastAPI Backend:  http://localhost:8000/docs" -ForegroundColor Cyan
    Write-Host "  - Built-in AI:      http://localhost:11434" -ForegroundColor Cyan
    Write-Host "  - PostgreSQL DB:    localhost:5432 (user: postgres, db: ai_recruiter)" -ForegroundColor Cyan
    Write-Host "  - Redis Queue:      localhost:6379" -ForegroundColor Cyan
} else {
    Write-Host "Docker Desktop is not currently running." -ForegroundColor Yellow
    Write-Host "To start the containerized stack:" -ForegroundColor White
    Write-Host "  1. Launch 'Docker Desktop' from your Start Menu." -ForegroundColor White
    Write-Host "  2. Run: docker compose up -d --build" -ForegroundColor White
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Startup check complete." -ForegroundColor Green
