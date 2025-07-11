# SoilWise Environment Configuration Guide

This document provides a comprehensive guide for configuring environment variables for the SoilWise platform.

## Quick Start

1. **Copy the environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Validate configuration:**
   ```bash
   node validate-env.js
   ```

3. **Generate secure secrets (Linux/macOS):**
   ```bash
   ./setup.sh
   ```

## Required Environment Variables

### Core Services

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Application environment | `development` | ✅ |
| `PORT` | API server port | `8080` | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `DB_PASSWORD` | Database password | - | ✅ |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` | ✅ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `ENCRYPTION_KEY` | Data encryption key | - | ✅ |
| `SESSION_SECRET` | Session signing secret | - | ✅ |

### MQTT Configuration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MQTT_BROKER_URL` | MQTT broker URL | `mqtt://localhost:1883` | ✅ |
| `MQTT_USERNAME` | MQTT broker username | `soilwise` | ✅ |
| `MQTT_PASSWORD` | MQTT broker password | `soilwise` | ✅ |
| `MQTT_CLIENT_ID` | MQTT client identifier | `soilwise-main` | ✅ |

### AI Services

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENAI_API_KEY` | OpenAI API key for embeddings | - | ⚠️ |
| `OLLAMA_BASE_URL` | Ollama API endpoint | `http://localhost:11434` | ✅ |
| `OLLAMA_MODEL` | Ollama model name | `llama3:8b` | ✅ |
| `CHROMADB_URL` | ChromaDB endpoint | `http://localhost:8000` | ✅ |
| `AI_SERVICE_URL` | AI service endpoint | `http://localhost:8082` | ✅ |

### Voice Assistant

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `WHISPER_MODEL` | Whisper model size | `base` | ✅ |
| `WHISPER_MODEL_PATH` | Whisper model directory | `./models/whisper` | ❌ |
| `TTS_MODEL` | TTS model language | `en-us` | ✅ |
| `COQUI_MODEL_PATH` | Coqui TTS model directory | `./models/coqui` | ❌ |
| `VOICE_ENABLED` | Enable voice features | `true` | ✅ |
| `WAKE_WORD` | Voice activation phrase | `hey_soilwise` | ✅ |

### Frontend (React/Vite)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | API endpoint for frontend | `http://localhost:8080/api` | ✅ |
| `VITE_MQTT_BROKER_URL` | MQTT WebSocket URL | `ws://localhost:8083/mqtt` | ✅ |
| `VITE_MQTT_USERNAME` | MQTT username for frontend | `soilwise` | ✅ |
| `VITE_MQTT_PASSWORD` | MQTT password for frontend | `soilwise` | ✅ |

### Edge Hub

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_PATH` | SQLite database path | `./data/soilwise.db` | ✅ |
| `CLOUD_SYNC_ENDPOINT` | Cloud sync API endpoint | `https://api.soilwise.com` | ✅ |
| `CLOUD_API_KEY` | Cloud API authentication key | - | ⚠️ |

### External APIs

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `WEATHER_API_KEY` | Weather service API key | - | ⚠️ |
| `MAPS_API_KEY` | Maps service API key | - | ⚠️ |
| `SATELLITE_API_KEY` | Satellite imagery API key | - | ❌ |

## Security Configuration

### Generating Secure Secrets

For production deployments, generate secure random values:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate encryption key
openssl rand -base64 32

# Generate session secret
openssl rand -base64 32
```

### Environment-Specific Configurations

#### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

#### Production
```env
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
```

## Service Dependencies

### Required Services

1. **PostgreSQL** - Primary database
   - Port: 5432
   - Database: `soilwise`

2. **Redis** - Caching and session storage
   - Port: 6379

3. **MQTT Broker** - IoT communication
   - Port: 1883 (MQTT)
   - Port: 9001 (WebSocket)

### Optional Services

1. **Ollama** - Local LLM inference
   - Port: 11434

2. **ChromaDB** - Vector database
   - Port: 8000

## Validation

Run the environment validation script to check your configuration:

```bash
node validate-env.js
```

This will verify that:
- All required variables are set
- No placeholder values remain
- Service endpoints are accessible

## Troubleshooting

### Common Issues

1. **MQTT Connection Failed**
   - Verify `MQTT_BROKER_URL` is correct
   - Check broker is running on specified port
   - Validate credentials

2. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check `DATABASE_URL` format
   - Validate database exists

3. **Frontend Can't Connect to API**
   - Verify `VITE_API_URL` matches API server
   - Check CORS configuration
   - Ensure API server is running

### Environment File Locations

- Main: `.env` (root directory)
- Web Dashboard: `apps/web-dashboard/.env.local`
- Edge Hub: Uses main `.env`
- Docker: Environment variables in `docker-compose.yml`

## Security Best Practices

1. **Never commit real secrets** to version control
2. **Use different secrets** for each environment
3. **Rotate secrets regularly** in production
4. **Limit CORS origins** to necessary domains
5. **Use HTTPS** in production
6. **Enable authentication** for external services

## Additional Resources

- [Docker Compose Configuration](./docker-compose.yml)
- [Setup Script](./setup.sh)
- [Development Guide](./docs/DEVELOPER_GUIDE.md)
- [Deployment Guide](./docs/deployment/README.md)
