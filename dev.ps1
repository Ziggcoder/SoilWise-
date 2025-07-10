# SoilWise Development Environment Setup Script
# PowerShell version for Windows

Write-Host "🌾 Starting SoilWise Development Environment..." -ForegroundColor Green
Write-Host ""

# Function to check if command exists
function Test-Command($command) {
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check Node.js
if (-not (Test-Command "node")) {
    Write-Host "[ERROR] Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
if (-not (Test-Command "npm")) {
    Write-Host "[ERROR] npm is not installed. Please install npm." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[INFO] Node.js version: $(node --version)" -ForegroundColor Cyan
Write-Host "[INFO] npm version: $(npm --version)" -ForegroundColor Cyan

# Install root dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing root dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install root dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Function to install workspace dependencies
function Install-WorkspaceDependencies($path) {
    if (Test-Path $path) {
        Push-Location $path
        if (-not (Test-Path "node_modules")) {
            Write-Host "[INFO] Installing dependencies for $path..." -ForegroundColor Yellow
            npm install
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[ERROR] Failed to install dependencies for $path" -ForegroundColor Red
                Pop-Location
                return $false
            }
        }
        Pop-Location
        return $true
    }
    return $false
}

# Install workspace dependencies
$workspaces = @("apps\api-server", "apps\web-dashboard", "apps\pwa-farmer", "apps\edge-hub")
foreach ($workspace in $workspaces) {
    Install-WorkspaceDependencies $workspace
}

Write-Host ""
Write-Host "[INFO] ✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "[INFO] Creating .env file from template..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "[WARNING] Please edit .env file to add your API keys and configuration." -ForegroundColor Yellow
    }
}

# Start development servers
Write-Host "🚀 Starting development servers..." -ForegroundColor Green
Write-Host ""
Write-Host "📊 Web Dashboard: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📱 PWA Farmer App: http://localhost:3001" -ForegroundColor Cyan
Write-Host "⚙️  API Server: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔧 Edge Hub: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Start the development environment
try {
    npm run dev
}
catch {
    Write-Host "[ERROR] Failed to start development servers" -ForegroundColor Red
    Write-Host "You can try starting individual services:" -ForegroundColor Yellow
    Write-Host "- API Server: cd apps\api-server && npm run dev" -ForegroundColor Yellow
    Write-Host "- Web Dashboard: cd apps\web-dashboard && npm run dev" -ForegroundColor Yellow
    Write-Host "- PWA Farmer: cd apps\pwa-farmer && npm run dev" -ForegroundColor Yellow
    Write-Host "- Edge Hub: cd apps\edge-hub && npm run dev" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
