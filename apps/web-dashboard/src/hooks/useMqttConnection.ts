import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import mqtt, { MqttClient } from 'mqtt'
import { setMqttConnection, setError } from '../store/slices/appSlice'
import { addAlert } from '../store/slices/alertSlice'

interface MqttConnectionState {
  isConnected: boolean
  error: string | null
  client: MqttClient | null
}

export const useMqttConnection = () => {
  const dispatch = useDispatch()
  const [state, setState] = useState<MqttConnectionState>({
    isConnected: false,
    error: null,
    client: null,
  })

  useEffect(() => {
    // MQTT broker configuration
    const brokerUrl = import.meta.env.VITE_MQTT_BROKER_URL || 'ws://localhost:8083/mqtt'
    const options = {
      clientId: `soilwise_dashboard_${Math.random().toString(16).substr(2, 8)}`,
      username: import.meta.env.VITE_MQTT_USERNAME,
      password: import.meta.env.VITE_MQTT_PASSWORD,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
    }

    try {
      const client = mqtt.connect(brokerUrl, options)

      client.on('connect', () => {
        console.log('MQTT connected successfully')
        setState(prev => ({ ...prev, isConnected: true, error: null, client }))
        dispatch(setMqttConnection(true))
        dispatch(setError(null))

        // Subscribe to relevant topics
        const topics = [
          'soilwise/sensors/+/data',
          'soilwise/sensors/+/status',
          'soilwise/alerts/+',
          'soilwise/system/status',
        ]

        topics.forEach(topic => {
          client.subscribe(topic, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${topic}:`, err)
            } else {
              console.log(`Subscribed to ${topic}`)
            }
          })
        })
      })

      client.on('error', (error) => {
        console.error('MQTT connection error:', error)
        const errorMessage = error.message || 'MQTT connection failed'
        setState(prev => ({ ...prev, isConnected: false, error: errorMessage }))
        dispatch(setMqttConnection(false))
        dispatch(setError(errorMessage))
      })

      client.on('offline', () => {
        console.warn('MQTT client went offline')
        setState(prev => ({ ...prev, isConnected: false }))
        dispatch(setMqttConnection(false))
      })

      client.on('reconnect', () => {
        console.log('MQTT attempting to reconnect...')
      })

      client.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString())
          
          // Handle different message types based on topic
          if (topic.includes('/alerts/')) {
            dispatch(addAlert({
              type: data.type || 'info',
              message: data.message,
              sensorId: data.sensorId,
            }))
          }
          
          // Handle sensor data updates
          if (topic.includes('/sensors/') && topic.includes('/data')) {
            // Sensor data will be handled by sensor slice
            console.log('Sensor data received:', { topic, data })
          }
          
          // Handle system status updates
          if (topic.includes('/system/status')) {
            console.log('System status update:', data)
          }
        } catch (error) {
          console.error('Failed to parse MQTT message:', error)
        }
      })

      setState(prev => ({ ...prev, client }))

      // Cleanup on unmount
      return () => {
        if (client) {
          client.end()
        }
      }
    } catch (error) {
      console.error('Failed to create MQTT client:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create MQTT client'
      setState(prev => ({ ...prev, error: errorMessage }))
      dispatch(setError(errorMessage))
    }
  }, [dispatch])

  const publishMessage = (topic: string, message: any) => {
    if (state.client && state.isConnected) {
      state.client.publish(topic, JSON.stringify(message), (error) => {
        if (error) {
          console.error('Failed to publish message:', error)
          dispatch(setError('Failed to publish message'))
        }
      })
    } else {
      console.warn('Cannot publish message: MQTT client not connected')
      dispatch(setError('MQTT client not connected'))
    }
  }

  return {
    isConnected: state.isConnected,
    error: state.error,
    client: state.client,
    publishMessage,
  }
}
