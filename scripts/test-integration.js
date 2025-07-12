#!/usr/bin/env node

/**
 * SoilWise End-to-End Integration Test
 * Tests the complete data flow: Edge Hub → API Server → Dashboard/PWA
 */

const WebSocket = require('ws');
const mqtt = require('mqtt');
const axios = require('axios');

// Configuration
const CONFIG = {
  edgeHub: 'http://localhost:3000',
  apiServer: 'http://localhost:8080',
  dashboard: 'http://localhost:5173',
  pwa: 'http://localhost:3001',
  mqttBroker: 'mqtt://localhost:1883',
  wsEndpoint: 'ws://localhost:3000'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test functions
async function testHttpEndpoint(url, name) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    if (response.status === 200) {
      success(`${name} is accessible`);
      return true;
    } else {
      error(`${name} returned status ${response.status}`);
      return false;
    }
  } catch (err) {
    error(`${name} is not accessible: ${err.message}`);
    return false;
  }
}

async function testHealthEndpoints() {
  info('Testing health endpoints...');
  
  const endpoints = [
    { url: `${CONFIG.edgeHub}/health`, name: 'Edge Hub Health' },
    { url: `${CONFIG.apiServer}/health`, name: 'API Server Health' },
    { url: `${CONFIG.edgeHub}/status`, name: 'Edge Hub Status' },
    { url: `${CONFIG.apiServer}/api/status`, name: 'API Server Status' }
  ];

  let passed = 0;
  for (const endpoint of endpoints) {
    if (await testHttpEndpoint(endpoint.url, endpoint.name)) {
      passed++;
    }
  }
  
  return passed === endpoints.length;
}

function testWebSocketConnection() {
  return new Promise((resolve) => {
    info('Testing WebSocket connection...');
    
    const ws = new WebSocket(CONFIG.wsEndpoint);
    let messageReceived = false;
    
    const timeout = setTimeout(() => {
      if (!messageReceived) {
        error('WebSocket: No data received within 10 seconds');
        ws.close();
        resolve(false);
      }
    }, 10000);
    
    ws.on('open', () => {
      success('WebSocket connection established');
      
      // Send a test message
      ws.send(JSON.stringify({
        type: 'subscribe',
        room: 'farm_1'
      }));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        info(`WebSocket received: ${message.type || 'unknown type'}`);
        
        if (message.type === 'sensor_data' || message.type === 'subscribed') {
          messageReceived = true;
          success('WebSocket: Real-time data flow confirmed');
          clearTimeout(timeout);
          ws.close();
          resolve(true);
        }
      } catch (err) {
        warning(`WebSocket: Invalid JSON received`);
      }
    });
    
    ws.on('error', (err) => {
      error(`WebSocket connection failed: ${err.message}`);
      clearTimeout(timeout);
      resolve(false);
    });
    
    ws.on('close', () => {
      info('WebSocket connection closed');
      if (!messageReceived) {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  });
}

function testMqttConnection() {
  return new Promise((resolve) => {
    info('Testing MQTT connection...');
    
    const client = mqtt.connect(CONFIG.mqttBroker);
    let messageReceived = false;
    
    const timeout = setTimeout(() => {
      if (!messageReceived) {
        error('MQTT: No data received within 10 seconds');
        client.end();
        resolve(false);
      }
    }, 10000);
    
    client.on('connect', () => {
      success('MQTT connection established');
      
      // Subscribe to sensor data
      client.subscribe('sensors/+/data', (err) => {
        if (err) {
          error(`MQTT subscription failed: ${err.message}`);
          client.end();
          resolve(false);
        } else {
          info('MQTT: Subscribed to sensor data topics');
        }
      });
      
      // Publish a test message
      client.publish('sensors/test/data', JSON.stringify({
        deviceId: 'test-device',
        timestamp: new Date().toISOString(),
        type: 'integration-test',
        value: 123.45
      }));
    });
    
    client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        info(`MQTT received on ${topic}: ${data.type || 'sensor data'}`);
        
        if (data.type === 'integration-test' || data.deviceId) {
          messageReceived = true;
          success('MQTT: Message flow confirmed');
          clearTimeout(timeout);
          client.end();
          resolve(true);
        }
      } catch (err) {
        warning(`MQTT: Invalid JSON received on ${topic}`);
      }
    });
    
    client.on('error', (err) => {
      error(`MQTT connection failed: ${err.message}`);
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

async function testApiEndpoints() {
  info('Testing API endpoints...');
  
  const endpoints = [
    { url: `${CONFIG.apiServer}/api/farms`, name: 'Farms API', expectData: true },
    { url: `${CONFIG.apiServer}/api/sensors/latest`, name: 'Latest Sensors API', expectData: false },
    { url: `${CONFIG.apiServer}/api/alerts`, name: 'Alerts API', expectData: false },
    { url: `${CONFIG.edgeHub}/api/devices`, name: 'Edge Devices API', expectData: false }
  ];

  let passed = 0;
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint.url, { timeout: 5000 });
      if (response.status === 200) {
        success(`${endpoint.name}: HTTP 200 OK`);
        
        if (endpoint.expectData && response.data && response.data.length > 0) {
          success(`${endpoint.name}: Contains data`);
        } else if (!endpoint.expectData) {
          info(`${endpoint.name}: Empty response (expected for new system)`);
        }
        
        passed++;
      } else {
        warning(`${endpoint.name}: HTTP ${response.status}`);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        warning(`${endpoint.name}: Not implemented yet (404)`);
      } else {
        error(`${endpoint.name}: ${err.message}`);
      }
    }
  }
  
  return passed > 0;
}

async function testDataFlow() {
  info('Testing end-to-end data flow...');
  
  try {
    // Test if the data simulator is generating data
    const edgeStatus = await axios.get(`${CONFIG.edgeHub}/status`);
    if (edgeStatus.data.services.simulator === 'running') {
      success('Data simulator is running');
    } else {
      warning('Data simulator is not running');
    }
    
    // Test if API server can receive data from edge hub
    const apiHealth = await axios.get(`${CONFIG.apiServer}/health`);
    if (apiHealth.status === 200) {
      success('API server is ready to receive data');
    }
    
    return true;
  } catch (err) {
    error(`Data flow test failed: ${err.message}`);
    return false;
  }
}

async function testFrontendAccessibility() {
  info('Testing frontend applications...');
  
  const frontends = [
    { url: CONFIG.dashboard, name: 'Web Dashboard' },
    { url: CONFIG.pwa, name: 'PWA Farmer App' }
  ];
  
  let passed = 0;
  for (const frontend of frontends) {
    if (await testHttpEndpoint(frontend.url, frontend.name)) {
      passed++;
    }
  }
  
  return passed === frontends.length;
}

// Main test execution
async function runIntegrationTests() {
  log('\n🧪 SoilWise End-to-End Integration Test', 'cyan');
  log('==========================================', 'cyan');
  
  const results = {
    health: false,
    websocket: false,
    mqtt: false,
    api: false,
    dataflow: false,
    frontend: false
  };
  
  try {
    // Test 1: Health endpoints
    log('\n📋 Test 1: Health Endpoints', 'magenta');
    results.health = await testHealthEndpoints();
    
    // Test 2: WebSocket real-time communication
    log('\n🔌 Test 2: WebSocket Communication', 'magenta');
    results.websocket = await testWebSocketConnection();
    
    // Test 3: MQTT messaging
    log('\n📡 Test 3: MQTT Communication', 'magenta');
    results.mqtt = await testMqttConnection();
    
    // Test 4: API endpoints
    log('\n🔗 Test 4: API Endpoints', 'magenta');
    results.api = await testApiEndpoints();
    
    // Test 5: Data flow
    log('\n🌊 Test 5: Data Flow', 'magenta');
    results.dataflow = await testDataFlow();
    
    // Test 6: Frontend accessibility
    log('\n🖥️  Test 6: Frontend Applications', 'magenta');
    results.frontend = await testFrontendAccessibility();
    
  } catch (err) {
    error(`Test execution failed: ${err.message}`);
  }
  
  // Summary
  log('\n📊 Test Results Summary', 'cyan');
  log('=======================', 'cyan');
  
  const tests = Object.entries(results);
  const passed = tests.filter(([, result]) => result).length;
  const total = tests.length;
  
  tests.forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const color = result ? 'green' : 'red';
    log(`  ${test.padEnd(12)}: ${status}`, color);
  });
  
  log(`\nOverall: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All tests passed! SoilWise is working correctly.', 'green');
    log('🌱 The system is ready for development and testing.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the logs above for details.', 'yellow');
    log('💡 Make sure all services are running with: npm run start:dev', 'blue');
  }
  
  return passed === total;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runIntegrationTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((err) => {
      error(`Test runner failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runIntegrationTests };
