export interface MQTTConfig {
  broker: {
    url: string
    port: number
    protocol: 'mqtt' | 'mqtts' | 'ws' | 'wss'
  }
  client: {
    clientId: string
    username?: string
    password?: string
    clean: boolean
    connectTimeout: number
    reconnectPeriod: number
    keepalive: number
  }
  topics: {
    sensors: string
    alerts: string
    commands: string
    sync: string
    voice: string
    system: string
  }
  qos: 0 | 1 | 2
  retain: boolean
}

export const getMQTTConfig = (): MQTTConfig => {
  const config: MQTTConfig = {
    broker: {
      url: process.env.MQTT_BROKER_URL || 'mqtt://localhost',
      port: parseInt(process.env.MQTT_BROKER_PORT || '1883'),
      protocol: (process.env.MQTT_PROTOCOL as any) || 'mqtt'
    },
    client: {
      clientId: process.env.MQTT_CLIENT_ID || `edge-hub-${Math.random().toString(16).substr(2, 8)}`,
      clean: process.env.MQTT_CLEAN_SESSION === 'true',
      connectTimeout: parseInt(process.env.MQTT_CONNECT_TIMEOUT || '4000'),
      reconnectPeriod: parseInt(process.env.MQTT_RECONNECT_PERIOD || '1000'),
      keepalive: parseInt(process.env.MQTT_KEEPALIVE || '60')
    },
    topics: {
      sensors: process.env.MQTT_TOPIC_SENSORS || 'soilwise/sensors/+/data',
      alerts: process.env.MQTT_TOPIC_ALERTS || 'soilwise/alerts/+',
      commands: process.env.MQTT_TOPIC_COMMANDS || 'soilwise/commands/+',
      sync: process.env.MQTT_TOPIC_SYNC || 'soilwise/sync/+',
      voice: process.env.MQTT_TOPIC_VOICE || 'soilwise/voice/+',
      system: process.env.MQTT_TOPIC_SYSTEM || 'soilwise/system/+'
    },
    qos: parseInt(process.env.MQTT_QOS || '1') as 0 | 1 | 2,
    retain: process.env.MQTT_RETAIN === 'true'
  }

  // Add optional properties if they exist
  if (process.env.MQTT_USERNAME) {
    config.client.username = process.env.MQTT_USERNAME
  }
  if (process.env.MQTT_PASSWORD) {
    config.client.password = process.env.MQTT_PASSWORD
  }

  return config
}

export interface LoRaWANConfig {
  gateway: {
    id: string
    key: string
    frequency: number
    spreadingFactor: number
    bandwidth: number
    codingRate: string
  }
  network: {
    server: string
    port: number
    appEUI: string
    appKey: string
  }
  devices: Array<{
    devEUI: string
    appEUI: string
    appKey: string
    deviceType: string
  }>
}

export const getLoRaWANConfig = (): LoRaWANConfig => {
  return {
    gateway: {
      id: process.env.LORAWAN_GATEWAY_ID || 'edge-hub-gw-001',
      key: process.env.LORAWAN_GATEWAY_KEY || '',
      frequency: parseInt(process.env.LORAWAN_FREQUENCY || '868100000'),
      spreadingFactor: parseInt(process.env.LORAWAN_SF || '7'),
      bandwidth: parseInt(process.env.LORAWAN_BW || '125'),
      codingRate: process.env.LORAWAN_CR || '4/5'
    },
    network: {
      server: process.env.LORAWAN_SERVER || 'localhost',
      port: parseInt(process.env.LORAWAN_PORT || '1700'),
      appEUI: process.env.LORAWAN_APP_EUI || '',
      appKey: process.env.LORAWAN_APP_KEY || ''
    },
    devices: JSON.parse(process.env.LORAWAN_DEVICES || '[]')
  }
}
