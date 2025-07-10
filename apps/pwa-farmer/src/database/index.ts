import Dexie, { Table } from 'dexie'

export interface Farm {
  id?: number
  name: string
  location: {
    lat: number
    lng: number
    address: string
  }
  size: number
  crops: string[]
  createdAt: Date
  updatedAt: Date
  syncStatus: 'pending' | 'synced' | 'conflict'
}

export interface Field {
  id?: number
  farmId: number
  name: string
  size: number
  cropType: string
  plantingDate: Date
  harvestDate?: Date
  location: {
    lat: number
    lng: number
    polygon: Array<{lat: number, lng: number}>
  }
  soilType: string
  syncStatus: 'pending' | 'synced' | 'conflict'
}

export interface Observation {
  id?: number
  fieldId: number
  type: 'visual' | 'measurement' | 'photo' | 'note'
  title: string
  description: string
  photos: string[]
  location: {
    lat: number
    lng: number
  }
  weather: {
    temperature: number
    humidity: number
    conditions: string
  }
  createdAt: Date
  syncStatus: 'pending' | 'synced' | 'conflict'
}

export interface SensorReading {
  id?: number
  sensorId: string
  fieldId: number
  type: 'soil_moisture' | 'temperature' | 'humidity' | 'ph' | 'nutrients'
  value: number
  unit: string
  timestamp: Date
  quality: 'good' | 'fair' | 'poor'
  syncStatus: 'pending' | 'synced' | 'conflict'
}

export interface Task {
  id?: number
  farmId: number
  fieldId?: number
  title: string
  description: string
  type: 'irrigation' | 'fertilization' | 'pest_control' | 'harvest' | 'maintenance'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate: Date
  completedAt?: Date
  assignedTo?: string
  syncStatus: 'pending' | 'synced' | 'conflict'
}

export interface SyncLog {
  id?: number
  tableName: string
  recordId: number
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: Date
  synced: boolean
  error?: string
}

export class FarmDatabase extends Dexie {
  farms!: Table<Farm>
  fields!: Table<Field>
  observations!: Table<Observation>
  sensorReadings!: Table<SensorReading>
  tasks!: Table<Task>
  syncLogs!: Table<SyncLog>

  constructor() {
    super('FarmDatabase')
    
    this.version(1).stores({
      farms: '++id, name, syncStatus',
      fields: '++id, farmId, name, cropType, syncStatus',
      observations: '++id, fieldId, type, createdAt, syncStatus',
      sensorReadings: '++id, sensorId, fieldId, type, timestamp, syncStatus',
      tasks: '++id, farmId, fieldId, type, priority, status, dueDate, syncStatus',
      syncLogs: '++id, tableName, recordId, timestamp, synced'
    })

    // Hooks for automatic sync logging
    this.farms.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
      obj.syncStatus = 'pending'
    })

    this.farms.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date()
      modifications.syncStatus = 'pending'
    })

    this.fields.hook('creating', (primKey, obj, trans) => {
      obj.syncStatus = 'pending'
    })

    this.fields.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.syncStatus = 'pending'
    })

    this.observations.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.syncStatus = 'pending'
    })

    this.sensorReadings.hook('creating', (primKey, obj, trans) => {
      obj.syncStatus = 'pending'
    })

    this.tasks.hook('creating', (primKey, obj, trans) => {
      obj.syncStatus = 'pending'
    })

    this.tasks.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.syncStatus = 'pending'
    })
  }

  // Sync methods
  async getPendingSync() {
    const pendingFarms = await this.farms.where('syncStatus').equals('pending').toArray()
    const pendingFields = await this.fields.where('syncStatus').equals('pending').toArray()
    const pendingObservations = await this.observations.where('syncStatus').equals('pending').toArray()
    const pendingReadings = await this.sensorReadings.where('syncStatus').equals('pending').toArray()
    const pendingTasks = await this.tasks.where('syncStatus').equals('pending').toArray()

    return {
      farms: pendingFarms,
      fields: pendingFields,
      observations: pendingObservations,
      sensorReadings: pendingReadings,
      tasks: pendingTasks
    }
  }

  async markSynced(tableName: string, ids: number[]) {
    const table = this[tableName as keyof FarmDatabase] as Table<any>
    await table.where('id').anyOf(ids).modify({ syncStatus: 'synced' })
  }

  async addSyncLog(tableName: string, recordId: number, action: 'create' | 'update' | 'delete', data: any) {
    await this.syncLogs.add({
      tableName,
      recordId,
      action,
      data,
      timestamp: new Date(),
      synced: false
    })
  }

  // Offline queries
  async getRecentObservations(limit: number = 10) {
    return await this.observations
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray()
  }

  async getTasksByStatus(status: Task['status']) {
    return await this.tasks
      .where('status')
      .equals(status)
      .toArray()
  }

  async getOverdueTasks() {
    const now = new Date()
    return await this.tasks
      .where('dueDate')
      .below(now)
      .and(task => task.status !== 'completed')
      .toArray()
  }

  async getSensorReadingsInRange(sensorId: string, startDate: Date, endDate: Date) {
    return await this.sensorReadings
      .where('sensorId')
      .equals(sensorId)
      .and(reading => reading.timestamp >= startDate && reading.timestamp <= endDate)
      .toArray()
  }
}

export const db = new FarmDatabase()
