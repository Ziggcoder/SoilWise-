#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * Validates that all required environment variables are set for SoilWise platform
 */

const fs = require('fs');
const path = require('path');

// Required environment variables for each service
const requiredEnvVars = {
  'Core Services': [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL', 
    'DB_PASSWORD',
    'REDIS_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
    'SESSION_SECRET'
  ],
  'MQTT Configuration': [
    'MQTT_BROKER_URL',
    'MQTT_USERNAME', 
    'MQTT_PASSWORD',
    'MQTT_CLIENT_ID'
  ],
  'AI Services': [
    'OPENAI_API_KEY',
    'OLLAMA_BASE_URL',
    'OLLAMA_MODEL',
    'CHROMADB_URL'
  ],
  'Voice Assistant': [
    'WHISPER_MODEL',
    'TTS_MODEL',
    'VOICE_ENABLED',
    'WAKE_WORD'
  ],
  'Frontend (React/Vite)': [
    'VITE_API_URL',
    'VITE_MQTT_BROKER_URL',
    'VITE_MQTT_USERNAME',
    'VITE_MQTT_PASSWORD'
  ],
  'Edge Hub': [
    'DB_PATH',
    'AI_SERVICE_URL',
    'CLOUD_SYNC_ENDPOINT',
    'CLOUD_API_KEY'
  ],
  'External APIs': [
    'WEATHER_API_KEY',
    'MAPS_API_KEY'
  ]
};

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  // Handle both Windows (\r\n) and Unix (\n) line endings
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
}

// Validate environment variables
function validateEnvironment() {
  console.log('🔍 Validating SoilWise Environment Configuration...\\n');
  
  const envVars = loadEnvFile();
  let hasErrors = false;
  let warnings = [];
  
  Object.entries(requiredEnvVars).forEach(([category, vars]) => {
    console.log(`📋 ${category}:`);
    
    vars.forEach(varName => {
      const value = envVars[varName];
      
      if (!value || value === '') {
        console.log(`  ❌ ${varName}: Missing or empty`);
        hasErrors = true;
      } else if (value.includes('your_') || value.includes('_here')) {
        console.log(`  ⚠️  ${varName}: Using placeholder value`);
        warnings.push(varName);
      } else {
        console.log(`  ✅ ${varName}: Configured`);
      }
    });
    
    console.log('');
  });
  
  // Summary
  if (hasErrors) {
    console.log('❌ Environment validation failed! Missing required variables.');
    console.log('   Please update your .env file with the missing variables.\\n');
  } else {
    console.log('✅ All required environment variables are set!\\n');
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warning: The following variables are using placeholder values:');
    warnings.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('   Update these with actual values for production use.\\n');
  }
  
  // Service-specific guidance
  console.log('📖 Service Configuration Guide:');
  console.log('   • API Server: Runs on PORT (default: 8080)');
  console.log('   • Web Dashboard: Runs on port 3000 (Vite dev server)');
  console.log('   • Edge Hub: Runs on port 3000 (configurable)');
  console.log('   • MQTT Broker: Expected on port 1883 (configurable)');
  console.log('   • PostgreSQL: Expected on port 5432');
  console.log('   • Redis: Expected on port 6379');
  console.log('   • Ollama: Expected on port 11434');
  console.log('   • ChromaDB: Expected on port 8000\\n');
  
  return !hasErrors;
}

// Run validation
if (require.main === module) {
  const isValid = validateEnvironment();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateEnvironment, loadEnvFile };
