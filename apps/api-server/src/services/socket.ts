import { Server } from 'socket.io'
import { logger } from '../utils/logger'

interface SocketData {
  userId?: string
  farmId?: string
}

export const setupSocketIO = (io: Server) => {
  logger.info('Setting up Socket.IO server')

  io.on('connection', (socket) => {
    logger.info('Client connected', { socketId: socket.id })

    // Handle authentication
    socket.on('authenticate', (data: { userId: string; farmId?: string }) => {
      const socketData = socket.data as SocketData
      socketData.userId = data.userId
      socketData.farmId = data.farmId
      
      logger.info('Socket authenticated', { 
        socketId: socket.id, 
        userId: data.userId,
        farmId: data.farmId 
      })

      // Join farm-specific room if provided
      if (data.farmId) {
        socket.join(`farm:${data.farmId}`)
      }

      socket.emit('authenticated', { success: true })
    })

    // Handle real-time sensor data subscription
    socket.on('subscribe:sensors', (data: { farmId: string; sensorIds?: string[] }) => {
      const room = `sensors:${data.farmId}`
      socket.join(room)
      
      logger.info('Socket subscribed to sensor data', { 
        socketId: socket.id, 
        farmId: data.farmId,
        sensorIds: data.sensorIds 
      })

      socket.emit('subscribed', { room, type: 'sensors' })
    })

    // Handle alert subscriptions
    socket.on('subscribe:alerts', (data: { farmId: string }) => {
      const room = `alerts:${data.farmId}`
      socket.join(room)
      
      logger.info('Socket subscribed to alerts', { 
        socketId: socket.id, 
        farmId: data.farmId 
      })

      socket.emit('subscribed', { room, type: 'alerts' })
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected', { 
        socketId: socket.id, 
        reason,
        userId: (socket.data as SocketData).userId 
      })
    })

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', { 
        socketId: socket.id, 
        error: error.message 
      })
    })
  })

  return io
}

// Helper functions to emit events
export const emitSensorReading = (io: Server, farmId: string, sensorData: any) => {
  io.to(`sensors:${farmId}`).emit('sensor:reading', sensorData)
  logger.debug('Emitted sensor reading', { farmId, sensorId: sensorData.sensorId })
}

export const emitAlert = (io: Server, farmId: string, alertData: any) => {
  io.to(`alerts:${farmId}`).emit('alert:new', alertData)
  io.to(`farm:${farmId}`).emit('alert:new', alertData)
  logger.debug('Emitted alert', { farmId, alertType: alertData.type })
}

export const emitSystemStatus = (io: Server, statusData: any) => {
  io.emit('system:status', statusData)
  logger.debug('Emitted system status', { status: statusData.status })
}
