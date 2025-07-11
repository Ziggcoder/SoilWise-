# Troubleshooting Guide - SoilWise Platform

## 🔍 Quick Diagnosis

### Service Status Check
```bash
# Check if all services are running
npm run dev

# Check individual service status
curl http://localhost:8081/api/v1/health    # API Server
curl http://localhost:3002/health           # Edge Hub
curl http://localhost:3005                  # Web Dashboard
curl http://localhost:5179                  # PWA Farmer App
```

### Common Service URLs
- **Web Dashboard**: http://localhost:3005
- **PWA Farmer App**: http://localhost:5179
- **API Server**: http://localhost:8081
- **Edge Hub**: http://localhost:3002
- **AI Services**: http://localhost:8082
- **Voice Assistant**: http://localhost:8083

## 🚨 Common Issues and Solutions

### 1. Port Already in Use

**Error Messages:**
```
Error: listen EADDRINUSE: address already in use :::8081
Port 3005 is already in use
```

**Solutions:**
```bash
# Find process using the port
lsof -i :8081
netstat -tulpn | grep :8081

# Kill process on port (Linux/Mac)
kill -9 $(lsof -t -i:8081)

# Kill process on port (Windows)
netstat -ano | findstr :8081
taskkill /PID <PID> /F

# Change port in environment variables
echo "API_PORT=8082" >> .env
```

### 2. Node.js Version Issues

**Error Messages:**
```
Error: Node.js version 16.x is not supported
The engine "node" is incompatible with this module
```

**Solutions:**
```bash
# Check Node.js version
node --version

# Update Node.js (using nvm)
nvm install 18
nvm use 18

# Update Node.js (direct download)
# Visit https://nodejs.org/ and download v18+
```

### 3. NPM Installation Issues

**Error Messages:**
```
npm ERR! code ENOENT
npm ERR! Cannot find module
npm ERR! peer dep missing
```

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Fix peer dependencies
npm install --legacy-peer-deps

# Install specific workspace
npm install --workspace=apps/api-server
```

### 4. Database Connection Issues

**Error Messages:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
SQLite: no such table: sensor_data
Database connection failed
```

**Solutions:**
```bash
# Check database file exists
ls -la data/soilwise.db

# Reset SQLite database
rm -f data/soilwise.db
mkdir -p data

# Check PostgreSQL connection
docker exec -it postgres psql -U soilwise -d soilwise_db

# Restart database service
docker-compose restart postgres
```

### 5. MQTT Connection Issues

**Error Messages:**
```
MQTT client error: Error: connect ECONNREFUSED
warn: MQTT client offline
```

**Solutions:**
```bash
# Start MQTT broker
docker run -it -p 1883:1883 eclipse-mosquitto

# Test MQTT connection
mosquitto_pub -h localhost -t test -m "hello"
mosquitto_sub -h localhost -t test

# Check MQTT broker logs
docker logs mqtt-broker

# Use different MQTT broker
echo "MQTT_BROKER_URL=mqtt://test.mosquitto.org:1883" >> .env
```

### 6. TypeScript Compilation Errors

**Error Messages:**
```
TSError: Unable to compile TypeScript
Type 'string | undefined' is not assignable to type 'string'
```

**Solutions:**
```bash
# Clear TypeScript cache
rm -rf dist/ build/ .turbo/

# Reinstall TypeScript
npm install -g typescript@latest
npm install --workspace=apps/api-server typescript

# Fix strict null checks
# Add ! to variables or use optional chaining
const value = process.env.API_KEY!
const value = process.env.API_KEY ?? 'default'
```

### 7. Docker Issues

**Error Messages:**
```
docker: Cannot connect to the Docker daemon
Error response from daemon: pull access denied
```

**Solutions:**
```bash
# Start Docker daemon
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Clean Docker cache
docker system prune -a

# Pull images manually
docker pull node:18-alpine
docker pull postgres:15
```

### 8. Permission Issues

**Error Messages:**
```
Error: EACCES: permission denied, open '/data/soilwise.db'
Permission denied (publickey)
```

**Solutions:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER /data/
chmod 755 /data/

# Fix npm permissions
sudo chown -R $USER ~/.npm

# Fix SSH permissions
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

### 9. Memory Issues

**Error Messages:**
```
JavaScript heap out of memory
FATAL ERROR: Ineffective mark-compacts near heap limit
```

**Solutions:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Check memory usage
free -h
docker stats

# Reduce concurrent processes
export NODE_OPTIONS="--max-old-space-size=2048"
```

### 10. AI Service Issues

**Error Messages:**
```
ChromaDB not available
Ollama connection failed
Whisper model not found
```

**Solutions:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve

# Download models
ollama pull llama3:8b

# Check model paths
ls -la models/
echo "WHISPER_MODEL_PATH=/path/to/models" >> .env
```

## 🔧 Service-Specific Troubleshooting

### Web Dashboard Issues

**Common Problems:**
- Vite dev server not starting
- Hot reload not working
- Build errors

**Solutions:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite/
rm -rf dist/

# Check Vite configuration
cd apps/web-dashboard
npm run dev -- --debug

# Manual build
npm run build
npm run preview
```

### API Server Issues

**Common Problems:**
- Express server not starting
- Middleware errors
- Route not found

**Solutions:**
```bash
# Check API server logs
cd apps/api-server
npm run dev

# Test specific endpoints
curl -v http://localhost:8081/api/v1/health
curl -v http://localhost:8081/api/v1/sensors

# Check middleware order
# Ensure cors, body-parser, routes are in correct order
```

### Edge Hub Issues

**Common Problems:**
- Serial port access denied
- Sensor communication failed
- MQTT publish errors

**Solutions:**
```bash
# Check serial port permissions
sudo usermod -a -G dialout $USER
sudo chmod 666 /dev/ttyUSB0

# List available ports
ls -la /dev/tty*

# Test serial communication
screen /dev/ttyUSB0 9600
```

### PWA Issues

**Common Problems:**
- Service worker not registering
- Offline functionality not working
- App not installable

**Solutions:**
```bash
# Check service worker
# Open browser dev tools > Application > Service Workers

# Force service worker update
# Dev tools > Application > Service Workers > Update

# Check PWA manifest
curl http://localhost:5179/manifest.json

# Test offline mode
# Dev tools > Network > Offline
```

## 🐛 Debug Mode

### Enable Debug Logging
```bash
# Set debug environment variables
export DEBUG=soilwise:*
export LOG_LEVEL=debug

# Start with debug output
npm run dev
```

### VS Code Debugging
```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug API Server",
            "type": "node",
            "request": "launch",
            "program": "${workspaceFolder}/apps/api-server/src/server.ts",
            "outFiles": ["${workspaceFolder}/**/*.js"],
            "env": {
                "NODE_ENV": "development",
                "DEBUG": "soilwise:*"
            },
            "runtimeArgs": ["-r", "ts-node/register"]
        }
    ]
}
```

### Browser Developer Tools
```javascript
// Enable debug mode in browser console
localStorage.setItem('debug', 'soilwise:*')

// Check service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log(registrations)
})

// Check PWA installation
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA install prompt available')
})
```

## 📊 Performance Issues

### Slow API Response
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null http://localhost:8081/api/v1/sensors

# Profile Node.js application
node --prof src/server.js
node --prof-process isolate-0x*.log > profile.txt
```

### High Memory Usage
```bash
# Monitor memory usage
ps aux | grep node
htop

# Check for memory leaks
node --inspect src/server.js
# Open chrome://inspect in browser
```

### Database Performance
```bash
# Check SQLite performance
sqlite3 data/soilwise.db ".timer on" "SELECT COUNT(*) FROM sensor_data;"

# Optimize database
sqlite3 data/soilwise.db "VACUUM;"
sqlite3 data/soilwise.db "ANALYZE;"
```

## 🔄 Reset and Recovery

### Complete Reset
```bash
# Stop all services
docker-compose down
npm run clean

# Remove all data
rm -rf data/
rm -rf node_modules/
rm -rf dist/
rm -rf build/
rm -rf .turbo/

# Fresh installation
npm install
npm run dev
```

### Service-Specific Reset
```bash
# Reset database
rm -f data/soilwise.db
mkdir -p data

# Reset Node.js modules
rm -rf node_modules/ package-lock.json
npm install

# Reset Docker
docker-compose down
docker system prune -a
docker-compose up -d
```

### Configuration Reset
```bash
# Reset environment variables
cp .env.example .env

# Reset to default ports
unset API_PORT
unset WEB_PORT
unset PWA_PORT
```

## 🔍 Log Analysis

### Service Logs
```bash
# View all service logs
npm run dev | tee logs/development.log

# Filter specific service logs
npm run dev | grep "api-server"
npm run dev | grep "ERROR"

# Docker logs
docker-compose logs -f api-server
docker-compose logs --tail=100 edge-hub
```

### Log Files Location
```
logs/
├── api-server.log
├── edge-hub.log
├── ai-services.log
├── voice-assistant.log
└── development.log
```

### Log Analysis Tools
```bash
# Search for errors
grep -r "ERROR" logs/
grep -r "FATAL" logs/

# Count log entries
wc -l logs/*.log

# Real-time log monitoring
tail -f logs/api-server.log
```

## 🆘 Getting Help

### Before Asking for Help
1. Check this troubleshooting guide
2. Search existing GitHub issues
3. Review the documentation
4. Try the reset steps above

### When Reporting Issues
Include the following information:
- Operating system and version
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Docker version (`docker --version`)
- Complete error message
- Steps to reproduce
- Service logs
- Environment variables (without sensitive data)

### Create Issue Template
```markdown
## Bug Report

**Environment:**
- OS: [e.g. Windows 11, Ubuntu 20.04]
- Node.js: [e.g. 18.15.0]
- npm: [e.g. 9.5.0]
- Docker: [e.g. 20.10.23]

**Describe the bug:**
A clear description of what the bug is.

**To Reproduce:**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior:**
A clear description of what you expected to happen.

**Error logs:**
```
Paste error logs here
```

**Screenshots:**
If applicable, add screenshots to help explain your problem.

**Additional context:**
Add any other context about the problem here.
```

## 🔧 Advanced Troubleshooting

### Network Issues
```bash
# Check network connectivity
ping google.com
nslookup localhost

# Check port accessibility
telnet localhost 8081
nc -zv localhost 8081

# Check firewall rules
sudo ufw status
sudo iptables -L
```

### SSL/TLS Issues
```bash
# Check certificate validity
openssl s_client -connect localhost:443 -servername localhost

# Test SSL configuration
curl -k https://localhost:443/api/v1/health
```

### Database Deep Dive
```bash
# Check database schema
sqlite3 data/soilwise.db ".schema"

# Check database integrity
sqlite3 data/soilwise.db "PRAGMA integrity_check;"

# Backup database
sqlite3 data/soilwise.db ".backup backup.db"
```

### Performance Profiling
```bash
# CPU profiling
node --prof src/server.js
node --prof-process isolate-0x*.log > cpu-profile.txt

# Memory profiling
node --inspect src/server.js
# Open chrome://inspect and take heap snapshots
```

## 🔮 Prevention Tips

### Regular Maintenance
```bash
# Update dependencies monthly
npm update
npm audit fix

# Clean up regularly
docker system prune -a
npm cache clean --force

# Monitor disk space
df -h
du -sh data/
```

### Health Monitoring
```bash
# Setup health checks
curl -f http://localhost:8081/api/v1/health || exit 1

# Monitor service uptime
ps aux | grep node
systemctl status soilwise
```

### Backup Strategy
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz data/ logs/
```

This troubleshooting guide should help developers quickly identify and resolve common issues with the SoilWise platform. Keep this document updated as new issues are discovered and resolved.
