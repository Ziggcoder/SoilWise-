import { SerialPort } from 'serialport'
import { logger } from '../utils/logger'
import { LocalDatabase } from '../database/localDatabase'

export interface SensorData {
  sensorId: string
  type: 'temperature' | 'humidity' | 'soil_moisture' | 'ph' | 'light'
  value: number
  unit: string
  timestamp: Date
  location?: {
    lat: number
    lng: number
  }
}

export class SensorManager {
  private database: LocalDatabase
  private serialPorts: Map<string, SerialPort> = new Map()
  private isRunning = false

  constructor(database: LocalDatabase) {
    this.database = database
  }

  async start(): Promise<void> {
    try {
      this.isRunning = true
      await this.initializeSerialPorts()
      this.startDataCollection()
      logger.info('SensorManager started successfully')
    } catch (error) {
      logger.error('Failed to start SensorManager:', error)
      throw error
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false
    for (const [portPath, port] of this.serialPorts) {
      try {
        await port.close()
        logger.info(`Closed serial port: ${portPath}`)
      } catch (error) {
        logger.error(`Error closing serial port ${portPath}:`, error)
      }
    }
    this.serialPorts.clear()
    logger.info('SensorManager stopped')
  }

  private async initializeSerialPorts(): Promise<void> {
    try {
      const ports = await SerialPort.list()
      logger.info(`Found ${ports.length} serial ports`)

      for (const portInfo of ports) {
        if (this.isSensorPort(portInfo)) {
          await this.connectToSensor(portInfo.path)
        }
      }
    } catch (error) {
      logger.error('Failed to initialize serial ports:', error)
    }
  }

  private isSensorPort(portInfo: any): boolean {
    // Check if port is likely a sensor device
    const sensorIdentifiers = ['Arduino', 'ESP32', 'USB Serial', 'CH340']
    return sensorIdentifiers.some(id => 
      portInfo.manufacturer?.includes(id) || 
      portInfo.productId?.includes(id)
    )
  }

  private async connectToSensor(portPath: string): Promise<void> {
    try {
      const port = new SerialPort({
        path: portPath,
        baudRate: 9600,
        autoOpen: false
      })

      await new Promise<void>((resolve, reject) => {
        port.open((err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      port.on('data', (data) => {
        this.processSensorData(portPath, data)
      })

      port.on('error', (error) => {
        logger.error(`Serial port error on ${portPath}:`, error)
      })

      this.serialPorts.set(portPath, port)
      logger.info(`Connected to sensor on port: ${portPath}`)
    } catch (error) {
      logger.error(`Failed to connect to sensor on ${portPath}:`, error)
    }
  }

  private processSensorData(portPath: string, data: Buffer): void {
    try {
      const dataStr = data.toString().trim()
      const sensorData = this.parseSensorData(portPath, dataStr)
      
      if (sensorData) {
        this.storeSensorData(sensorData)
      }
    } catch (error) {
      logger.error(`Error processing sensor data from ${portPath}:`, error)
    }
  }

  private parseSensorData(portPath: string, dataStr: string): SensorData | null {
    try {
      // Expected format: "SENSOR_ID,TYPE,VALUE,UNIT"
      // Example: "SOIL_01,soil_moisture,45.2,percent"
      const parts = dataStr.split(',')
      
      if (parts.length < 4) {
        return null
      }

      return {
        sensorId: parts[0],
        type: parts[1] as any,
        value: parseFloat(parts[2]),
        unit: parts[3],
        timestamp: new Date()
      }
    } catch (error) {
      logger.error(`Error parsing sensor data: ${dataStr}`, error)
      return null
    }
  }

  private async storeSensorData(data: SensorData): Promise<void> {
    try {
      await this.database.insertSensorData(data)
      logger.debug(`Stored sensor data: ${data.sensorId} = ${data.value}${data.unit}`)
    } catch (error) {
      logger.error('Error storing sensor data:', error)
    }
  }

  private startDataCollection(): void {
    // Simulate sensor data collection for demo purposes
    setInterval(() => {
      if (this.isRunning) {
        const mockData: SensorData = {
          sensorId: 'DEMO_SENSOR_01',
          type: 'soil_moisture',
          value: Math.random() * 100,
          unit: 'percent',
          timestamp: new Date()
        }
        this.storeSensorData(mockData)
      }
    }, 30000) // Every 30 seconds
  }

  async getSensorData(sensorId?: string, limit: number = 100): Promise<SensorData[]> {
    return this.database.getSensorData(sensorId, limit)
  }

  async getLatestSensorData(sensorId: string): Promise<SensorData | null> {
    const data = await this.database.getSensorData(sensorId, 1)
    return data[0] || null
  }
}
