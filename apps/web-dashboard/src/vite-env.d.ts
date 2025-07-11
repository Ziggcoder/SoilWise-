/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_VERSION: string
  readonly VITE_MQTT_BROKER_URL: string
  readonly VITE_MQTT_USERNAME: string
  readonly VITE_MQTT_PASSWORD: string
  readonly VITE_OFFLINE_ENABLED: string
  readonly VITE_SYNC_ENABLED: string
  readonly VITE_EDGE_MODE: string
  readonly VITE_VOICE_ENABLED: string
  readonly VITE_AI_ENABLED: string
  readonly VITE_MAPS_API_KEY: string
  readonly VITE_DEBUG: string
  readonly VITE_LOG_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
