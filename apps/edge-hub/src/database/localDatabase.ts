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
    // Don't auto-initialize, let the caller do it
  }

  async initialize(): Promise<void> {
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

    // Create fields table
    await knex.schema.createTable('fields', (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.float('area').notNullable()
      table.string('crop_type').notNullable()
      table.string('owner_id').notNullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      table.index(['owner_id'])
    })

    // Create observations table
    await knex.schema.createTable('observations', (table) => {
      table.increments('id').primary()
      table.integer('field_id').notNullable()
      table.string('type').notNullable()
      table.text('description').nullable()
      table.timestamp('timestamp').notNullable()
      table.json('data').nullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      table.index(['field_id'])
    })

    // Create photos table
    await knex.schema.createTable('photos', (table) => {
      table.increments('id').primary()
      table.integer('observation_id').notNullable()
      table.string('url').notNullable()
      table.string('type').notNullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.index(['observation_id'])
    })

    // Create tasks table
    await knex.schema.createTable('tasks', (table) => {
      table.increments('id').primary()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.timestamp('due_date').nullable()
      table.boolean('completed').defaultTo(false)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
    })

    logger.info('Database tables created successfully')
  }

  async insertSensorData(data: SensorData | any): Promise<number> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const [id] = await this.knex('sensor_data').insert({
        sensor_id: data.sensorId || data.sensor_id,
        type: data.type,
        value: data.value,
        unit: data.unit,
        timestamp: data.timestamp,
        latitude: data.location?.lat,
        longitude: data.location?.lng,
        synced: false,
        created_at: new Date(),
        updated_at: new Date()
      })

      return id || 0
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
        ...(row.latitude && row.longitude && {
          location: {
            lat: row.latitude,
            lng: row.longitude
          }
        })
      })) as SensorData[]
    } catch (error) {
      logger.error('Failed to get sensor data:', error)
      throw error
    }
  }

  // Cloud sync support methods
  async getUnsyncedSensorData(limit: number = 100): Promise<any[]> {
    return this.knex!('sensor_data')
      .whereNull('synced_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
  }

  async getUnsyncedAlerts(limit: number = 100): Promise<any[]> {
    return this.knex!('alerts')
      .whereNull('synced_at')
      .orderBy('created_at', 'desc')
      .limit(limit)
  }

  async getUnsyncedFarms(limit: number = 100): Promise<any[]> {
    return this.knex!('farms')
      .whereNull('synced_at')
      .orderBy('updated_at', 'desc')
      .limit(limit)
  }

  async markSensorDataSynced(ids: number[]): Promise<void> {
    await this.knex!('sensor_data')
      .whereIn('id', ids)
      .update({ synced_at: new Date() })
  }

  async markAlertsSynced(ids: number[]): Promise<void> {
    await this.knex!('alerts')
      .whereIn('id', ids)
      .update({ synced_at: new Date() })
  }

  async markFarmsSynced(ids: number[]): Promise<void> {
    await this.knex!('farms')
      .whereIn('id', ids)
      .update({ synced_at: new Date() })
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

      return id || 0
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

  async setConfiguration(key: string, value: any): Promise<void> {
    await this.knex!('configurations')
      .insert({
        key,
        value: JSON.stringify(value),
        updated_at: new Date()
      })
      .onConflict('key')
      .merge(['value', 'updated_at'])
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
    const result = await this.knex!('configurations')
      .where('key', 'sync_status')
      .first()
    
    return result ? JSON.parse(result.value) : null
  }

  async saveSyncStatus(status: any): Promise<void> {
    await this.setConfiguration('sync_status', status)
  }

  async getFields(): Promise<any[]> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      return await this.knex('fields').select('*')
    } catch (error) {
      logger.error('Failed to get fields:', error)
      throw error
    }
  }

  async getFarmsModifiedSince(since: Date): Promise<Farm[]> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      return await this.knex('farms')
        .select('*')
        .where('updated_at', '>', since)
    } catch (error) {
      logger.error('Failed to get farms modified since:', error)
      throw error
    }
  }

  async getFieldsModifiedSince(since: Date): Promise<any[]> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      return await this.knex('fields')
        .select('*')
        .where('updated_at', '>', since)
    } catch (error) {
      logger.error('Failed to get fields modified since:', error)
      throw error
    }
  }

  async getSensorDataSince(since: Date): Promise<SensorData[]> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const rows = await this.knex('sensor_data')
        .select('*')
        .where('timestamp', '>', since)
        .orderBy('timestamp', 'desc')

      return rows.map(row => ({
        sensorId: row.sensor_id,
        type: row.type,
        value: row.value,
        unit: row.unit,
        timestamp: new Date(row.timestamp),
        ...(row.latitude && row.longitude ? {
          location: {
            lat: row.latitude,
            lng: row.longitude
          }
        } : {})
      }))
    } catch (error) {
      logger.error('Failed to get sensor data since:', error)
      throw error
    }
  }

  async getFieldById(id: number): Promise<any> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      return await this.knex('fields')
        .select('*')
        .where('id', id)
        .first()
    } catch (error) {
      logger.error('Failed to get field by id:', error)
      throw error
    }
  }

  async updateField(id: number, field: any): Promise<void> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      await this.knex('fields')
        .where('id', id)
        .update({
          ...field,
          updated_at: new Date()
        })
    } catch (error) {
      logger.error('Failed to update field:', error)
      throw error
    }
  }

  async insertField(field: any): Promise<number> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const [id] = await this.knex('fields').insert({
        ...field,
        created_at: new Date(),
        updated_at: new Date()
      })
      return id || 0
    } catch (error) {
      logger.error('Failed to insert field:', error)
      throw error
    }
  }

  async insertObservation(observation: any): Promise<number> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const [id] = await this.knex('observations').insert({
        ...observation,
        created_at: new Date(),
        updated_at: new Date()
      })
      return id || 0
    } catch (error) {
      logger.error('Failed to insert observation:', error)
      throw error
    }
  }

  async insertPhoto(photo: any): Promise<number> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const [id] = await this.knex('photos').insert({
        ...photo,
        created_at: new Date(),
        updated_at: new Date()
      })
      return id || 0
    } catch (error) {
      logger.error('Failed to insert photo:', error)
      throw error
    }
  }

  async insertTask(task: any): Promise<number> {
    if (!this.knex) throw new Error('Database not initialized')

    try {
      const [id] = await this.knex('tasks').insert({
        ...task,
        created_at: new Date(),
        updated_at: new Date()
      })
      return id || 0
    } catch (error) {
      logger.error('Failed to insert task:', error)
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

  get  isConnected(): boolean {
    return this._isConnected
  }

  // Missing method implementations
  async getFarms(ownerId?: string): Promise<any[]> {
    try {
      if (!this.knex) throw new Error('Database not initialized');
      
      let query = this.knex('farms');
      if (ownerId) {
        query = query.where('owner_id', ownerId);
      }
      return await query.select('*');
    } catch (error) {
      logger.error('Error getting farms:', error);
      return [];
    }
  }

  async insertFarm(farm: any): Promise<string> {
    try {
      if (!this.knex) throw new Error('Database not initialized');
      
      const [id] = await this.knex('farms').insert({
        name: farm.name,
        owner_id: farm.ownerId,
        location: JSON.stringify(farm.location),
        size: farm.size,
        crop_type: farm.cropType,
        created_at: new Date().toISOString()
      });
      
      return id?.toString() || '0';
    } catch (error) {
      logger.error('Error inserting farm:', error);
      throw error;
    }
  }

  async updateConfigurations(configs: Record<string, any>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(configs)) {
        await this.setConfiguration(key, value);
      }
    } catch (error) {
      logger.error('Error updating configurations:', error);
      throw error;
    }
  }
}
