import { Knex } from 'knex'

export interface DatabaseConfig {
  client: string
  connection: {
    filename: string
  }
  useNullAsDefault: boolean
  pool?: {
    min: number
    max: number
    acquireTimeoutMillis: number
    createTimeoutMillis: number
    destroyTimeoutMillis: number
    idleTimeoutMillis: number
    reapIntervalMillis: number
    createRetryIntervalMillis: number
  }
  migrations?: {
    directory: string
    tableName: string
  }
  seeds?: {
    directory: string
  }
}

export const getDatabaseConfig = (): Knex.Config => {
  const config: DatabaseConfig = {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_PATH || './data/edge-hub.db'
    },
    useNullAsDefault: true,
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }

  // Production optimizations
  if (process.env.NODE_ENV === 'production') {
    config.pool = {
      min: 1,
      max: 5,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    }
  }

  return config
}

export const createDatabaseTables = async (knex: Knex): Promise<void> => {
  // Sensor data table
  if (!(await knex.schema.hasTable('sensor_data'))) {
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
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      
      table.index(['sensor_id', 'timestamp'])
      table.index(['synced'])
      table.index(['type'])
    })
  }

  // Alerts table
  if (!(await knex.schema.hasTable('alerts'))) {
    await knex.schema.createTable('alerts', (table) => {
      table.increments('id').primary()
      table.string('type').notNullable()
      table.text('message').notNullable()
      table.enum('severity', ['low', 'medium', 'high', 'critical']).notNullable()
      table.timestamp('timestamp').notNullable()
      table.string('sensor_id').nullable()
      table.string('farm_id').nullable()
      table.boolean('resolved').defaultTo(false)
      table.boolean('synced').defaultTo(false)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      
      table.index(['timestamp', 'resolved'])
      table.index(['synced'])
      table.index(['severity'])
    })
  }

  // Farms table
  if (!(await knex.schema.hasTable('farms'))) {
    await knex.schema.createTable('farms', (table) => {
      table.increments('id').primary()
      table.string('name').notNullable()
      table.float('latitude').notNullable()
      table.float('longitude').notNullable()
      table.float('size').notNullable()
      table.string('crop_type').notNullable()
      table.string('owner_id').notNullable()
      table.boolean('synced').defaultTo(false)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      
      table.index(['owner_id'])
      table.index(['synced'])
    })
  }

  // Voice queries table
  if (!(await knex.schema.hasTable('voice_queries'))) {
    await knex.schema.createTable('voice_queries', (table) => {
      table.increments('id').primary()
      table.string('query_id').unique().notNullable()
      table.text('transcript').nullable()
      table.text('response').nullable()
      table.timestamp('timestamp').notNullable()
      table.float('confidence').nullable()
      table.boolean('synced').defaultTo(false)
      table.json('metadata').nullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
      
      table.index(['timestamp'])
      table.index(['synced'])
    })
  }

  // Sync logs table
  if (!(await knex.schema.hasTable('sync_logs'))) {
    await knex.schema.createTable('sync_logs', (table) => {
      table.increments('id').primary()
      table.string('table_name').notNullable()
      table.integer('record_id').notNullable()
      table.enum('action', ['create', 'update', 'delete']).notNullable()
      table.timestamp('timestamp').notNullable()
      table.boolean('success').notNullable()
      table.text('error_message').nullable()
      table.json('payload').nullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
      
      table.index(['table_name', 'record_id'])
      table.index(['timestamp'])
      table.index(['success'])
    })
  }

  // Device registry table
  if (!(await knex.schema.hasTable('device_registry'))) {
    await knex.schema.createTable('device_registry', (table) => {
      table.increments('id').primary()
      table.string('device_id').unique().notNullable()
      table.string('device_type').notNullable() // 'sensor', 'camera', 'gateway'
      table.string('connection_type').notNullable() // 'serial', 'mqtt', 'http', 'lorawan'
      table.json('config').notNullable()
      table.enum('status', ['active', 'inactive', 'error']).defaultTo('inactive')
      table.timestamp('last_seen').nullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      
      table.index(['device_type'])
      table.index(['status'])
      table.index(['last_seen'])
    })
  }
}
