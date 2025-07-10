import Knex from 'knex'
import { logger } from '../utils/logger'
import { SensorData } from '../services/sensorManager'

export interface Alert {
  id?: number
  type: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  sensorId?: string
  farmId?: string
  resolved: boolean
  synced: boolean
}

export interface Farm {
  id?: number
  name: string
  location: {
    lat: number
    lng: number
  }
  size: number
  cropType: string
  ownerId: string
  created: Date
  synced: boolean
}

export class LocalDatabase {
  private knex: Knex.Knex | null = null
  private _isConnected = false

  constructor() {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    try {
      this.knex = Knex({
        client: 'sqlite3',
        connection: {
          filename: process.env.DB_PATH || './data/soilwise.db'
        },
        useNullAsDefault: true,
        migrations: {
          directory: './migrations'
        }
      })

      await this.createTables()
      this._isConnected = true
      logger.info('Local database initialized successfully')
    } catch (error) {
      logger.error('Failed to initialize local database:', error)
      throw error
    }
  }

  private async createTables(): Promise<void> {
    if (!this.knex) throw new Error('Database not initialized')

    const knex = this.knex // Store reference to avoid null checks

    // Create sensor_data table
    await knex.schema.createTable('sensor_data', (table) => {
      table.increments('id').primary()
      table.string('sensor_id').notNullable()
      table.string('type').notNullable()
      table.float('value').notNullable()
      table.string('unit').notNullable()
      table.timestamp('timestamp').notNullable()
      table.float('latitude').nullable()
      table.float('longitude').nullable()
      table.boolean('synced').defaultTo(false)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.index(['sensor_id', 'timestamp'])
      table.index(['synced'])
    })

    // Create alerts table
    await knex.schema.createTable('alerts', (table) => {
      table.increments('id').primary()
      table.string('type').notNullable()
      table.text('message').notNullable()
      table.string('severity').notNullable()
      table.timestamp('timestamp').notNullable()
      table.string('sensor_id').nullable()
      table.string('farm_id').nullable()
      table.boolean('resolved').defaultTo(false)
      table.boolean('synced').defaultTo(false)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.index(['timestamp', 'resolved'])
      table.index(['synced'])
    })

    // Create farms table
    await knex.schema.createTable('farms', (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.float('latitude').notNullable()
      table.float('longitude').notNullable()
      table.float('size').notNullable()
      table.string('crop_type').notNullable()
      table.string('owner_id').notNullable()
      table.timestamp('created').defaultTo(knex.fn.now())
      table.boolean('synced').defaultTo(false)
      table.index(['owner_id'])
      table.index(['synced'])
    })

    // Create configurations table
    await knex.schema.createTable('configurations', (table) => {
      table.increments('id').primary()
      table.string('key').notNullable().unique()
      table.json('value').notNullable()
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })

    // Create sync_status table
    await knex.schema.createTable('sync_status', (table) => {
      table.increments('id').primary()
      table.timestamp('last_sync').nullable()
      table.boolean('is_sync').defaultTo(false)
      table.integer('pending_items').defaultTo(0)
      table.integer('failed_items').defaultTo(0)
      table.integer('total_synced').defaultTo(0)
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })

    logger.info('Database tables created successfully')
  }

  async insertSensorData(data: SensorData): Promise<number> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const [id] = await this.knex('sensor_data').insert({
        sensor_id: data.sensorId,
        type: data.type,
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp,
        latitude: data.location?.lat,
        longitude: data.location?.lng,
        synced: false
      })

      return id
    } catch (error) {
      logger.error('Failed to insert sensor data:', error)
      throw error
    }
  }

  async getSensorData(sensorId?: string, limit: number = 100): Promise<SensorData[]> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      let query = this.knex('sensor_data')
        .select('*')
        .orderBy('timestamp', 'desc')
        .limit(limit)

      if (sensorId) {
        query = query.where('sensor_id', sensorId)
      }

      const rows = await query

      return rows.map(row => ({
        sensorId: row.sensor_id,
        type: row.type,
        value: row.value,
        unit: row.unit,
        timestamp: new Date(row.timestamp),
        location: row.latitude && row.longitude ? {
          lat: row.latitude,
          lng: row.longitude
        } : undefined
      }))
    } catch (error) {
      logger.error('Failed to get sensor data:', error)
      throw error
    }
  }

  async getUnsyncedSensorData(limit: number = 100): Promise<any[]> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const rows = await this.knex('sensor_data')
        .select('*')
        .where('synced', false)
        .orderBy('timestamp', 'asc')
        .limit(limit)

      return rows
    } catch (error) {
      logger.error('Failed to get unsynced sensor data:', error)
      throw error
    }
  }

  async markSensorDataSynced(ids: number[]): Promise<void> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      await this.knex('sensor_data')
        .whereIn('id', ids)
        .update({ synced: true })
    } catch (error) {
      logger.error('Failed to mark sensor data as synced:', error)
      throw error
    }
  }

  async insertAlert(alert: Alert): Promise<number> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const [id] = await this.knex('alerts').insert({
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        timestamp: alert.timestamp,
        sensor_id: alert.sensorId,
        farm_id: alert.farmId,
        resolved: alert.resolved,
        synced: false
      })

      return id
    } catch (error) {
      logger.error('Failed to insert alert:', error)
      throw error
    }
  }

  async getAlerts(limit: number = 100): Promise<Alert[]> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const rows = await this.knex('alerts')
        .select('*')
        .orderBy('timestamp', 'desc')
        .limit(limit)

      return rows.map(row => ({
        id: row.id,
        type: row.type,
        message: row.message,
        severity: row.severity,
        timestamp: new Date(row.timestamp),
        sensorId: row.sensor_id,
        farmId: row.farm_id,
        resolved: row.resolved,
        synced: row.synced
      }))
    } catch (error) {
      logger.error('Failed to get alerts:', error)
      throw error
    }
  }

  async getUnsyncedAlerts(limit: number = 100): Promise<any[]> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const rows = await this.knex('alerts')
        .select('*')
        .where('synced', false)
        .orderBy('timestamp', 'asc')
        .limit(limit)

      return rows
    } catch (error) {
      logger.error('Failed to get unsynced alerts:', error)
      throw error
    }
  }

  async markAlertsSynced(ids: number[]): Promise<void> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      await this.knex('alerts')
        .whereIn('id', ids)
        .update({ synced: true })
    } catch (error) {
      logger.error('Failed to mark alerts as synced:', error)
      throw error
    }
  }

  async insertFarm(farm: Farm): Promise<number> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const [id] = await this.knex('farms').insert({
        name: farm.name,
        latitude: farm.location.lat,
        longitude: farm.location.lng,
        size: farm.size,
        crop_type: farm.cropType,
        owner_id: farm.ownerId,
        created: farm.created,
        synced: false
      })

      return id
    } catch (error) {
      logger.error('Failed to insert farm:', error)
      throw error
    }
  }

  async getFarms(ownerId?: string): Promise<Farm[]> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      let query = this.knex('farms').select('*')

      if (ownerId) {
        query = query.where('owner_id', ownerId)
      }

      const rows = await query

      return rows.map(row => ({
        id: row.id,
        name: row.name,
        location: {
          lat: row.latitude,
          lng: row.longitude
        },
        size: row.size,
        cropType: row.crop_type,
        ownerId: row.owner_id,
        created: new Date(row.created),
        synced: row.synced
      }))
    } catch (error) {
      logger.error('Failed to get farms:', error)
      throw error
    }
  }

  async getUnsyncedFarms(limit: number = 100): Promise<any[]> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const rows = await this.knex('farms')
        .select('*')
        .where('synced', false)
        .limit(limit)

      return rows
    } catch (error) {
      logger.error('Failed to get unsynced farms:', error)
      throw error
    }
  }

  async markFarmsSynced(ids: number[]): Promise<void> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      await this.knex('farms')
        .whereIn('id', ids)
        .update({ synced: true })
    } catch (error) {
      logger.error('Failed to mark farms as synced:', error)
      throw error
    }
  }

  async updateConfigurations(configurations: Record<string, any>): Promise<void> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      for (const [key, value] of Object.entries(configurations)) {
        await this.knex('configurations')
          .insert({
            key,
            value: JSON.stringify(value),
            updated_at: new Date()
          })
          .onConflict('key')
          .merge(['value', 'updated_at'])
      }
    } catch (error) {
      logger.error('Failed to update configurations:', error)
      throw error
    }
  }

  async getConfiguration(key: string): Promise<any> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const row = await this.knex('configurations')
        .select('value')
        .where('key', key)
        .first()

      return row ? JSON.parse(row.value) : null
    } catch (error) {
      logger.error('Failed to get configuration:', error)
      throw error
    }
  }

  async getSyncStatus(): Promise<any> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const row = await this.knex('sync_status')
        .select('*')
        .orderBy('id', 'desc')
        .first()

      return row ? {
        lastSync: row.last_sync,
        isSync: row.is_sync,
        pendingItems: row.pending_items,
        failedItems: row.failed_items,
        totalSynced: row.total_synced
      } : null
    } catch (error) {
      logger.error('Failed to get sync status:', error)
      throw error
    }
  }

  async saveSyncStatus(status: any): Promise<void> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      await this.knex('sync_status').insert({
        last_sync: status.lastSync,
        is_sync: status.isSync,
        pending_items: status.pendingItems,
        failed_items: status.failedItems,
        total_synced: status.totalSynced,
        updated_at: new Date()
      })
    } catch (error) {
      logger.error('Failed to save sync status:', error)
      throw error
    }
  }

  async close(): Promise<void> {
    if (this.knex) {
      await this.knex.destroy()
      this.knex = null
      this._isConnected = false
      logger.info('Database connection closed')
    }
  }

  get isConnected(): boolean {
    return this._isConnected
  }
}
