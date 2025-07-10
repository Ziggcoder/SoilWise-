# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+
- npm 8+
- Git

## Quick Setup (Windows)

### Option 1: Using Batch Script
```cmd
dev.bat
```

### Option 2: Using PowerShell
```powershell
.\dev.ps1
```

### Option 3: Using npm directly
```cmd
npm install
npm run dev
```

## Manual Setup

1. **Install dependencies:**
```cmd
npm install
```

2. **Setup environment:**
```cmd
copy .env.example .env
```
Edit `.env` file with your configuration.

3. **Start development servers:**
```cmd
npm run dev
```

## Services

- **Web Dashboard**: http://localhost:3000
- **PWA Farmer App**: http://localhost:3001  
- **API Server**: http://localhost:8080
- **Edge Hub**: http://localhost:3002

## Individual Services

If you want to run services individually:

```cmd
# API Server
cd apps\api-server
npm install
npm run dev

# Web Dashboard
cd apps\web-dashboard
npm install
npm run dev

# PWA Farmer App
cd apps\pwa-farmer
npm install
npm run dev

# Edge Hub
cd apps\edge-hub
npm install
npm run dev
```

## Docker Setup (Optional)

```cmd
docker-compose up -d
```

## Troubleshooting

### Turbo not found
If you get "turbo not found" error:
- Use `npm run dev` instead of `turbo run dev`
- Or install turbo globally: `npm install -g turbo`

### Port conflicts
If ports are in use, modify the ports in:
- `apps/*/package.json` scripts
- `docker-compose.yml`

### Dependencies issues
```cmd
# Clean install
npm run clean
npm install
npm run install:all
```

## Need Help?

- Check the full README.md for detailed documentation
- See `docs/` folder for comprehensive guides
- Open an issue on GitHub
