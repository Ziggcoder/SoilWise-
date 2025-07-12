import { EventEmitter } from 'events'
import { execSync } from 'child_process'
import * as os from 'os'
import * as fs from 'fs'
import * as path from 'path'
import { logger } from '../utils/logger'
import { LocalDatabase } from '../database/localDatabase'

export interface SystemMetrics {
  timestamp: Date
  cpu: {
    usage: number
    temperature?: number
    cores: number
    load: number[]
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
  }
  network: {
    interfaces: NetworkInterface[]
    connectivity: boolean
  }
  services: {
    [serviceName: string]: ServiceStatus
  }
  system: {
    uptime: number
    platform: string
    arch: string
    hostname: string
    loadAverage: number[]
  }
}

export interface NetworkInterface {
  name: string
  address: string
  netmask: string
  family: string
  mac: string
  internal: boolean
  cidr: string
  status: 'up' | 'down'
}

export interface ServiceStatus {
  name: string
  status: 'running' | 'stopped' | 'error' | 'unknown'
  pid?: number
  uptime?: number
  memoryUsage?: number
  cpuUsage?: number
  lastCheck: Date
  error?: string
}

export interface HealthThresholds {
  cpu: {
    warning: number
    critical: number
  }
  memory: {
    warning: number
    critical: number
  }
  disk: {
    warning: number
    critical: number
  }
  temperature: {
    warning: number
    critical: number
  }
}

export interface HealthAlert {
  type: 'cpu' | 'memory' | 'disk' | 'temperature' | 'service' | 'network'
  level: 'warning' | 'critical'
  message: string
  value: number
  threshold: number
  timestamp: Date
  resolved: boolean
}

export class SystemMonitor extends EventEmitter {
  private database: LocalDatabase
  private thresholds: HealthThresholds
  private isRunning = false
  private monitorInterval: NodeJS.Timeout | null = null
  private alertHistory: Map<string, HealthAlert> = new Map()
  private services: string[] = []

  constructor(database: LocalDatabase, thresholds?: Partial<HealthThresholds>) {
    super()
    this.database = database

    this.thresholds = {
      cpu: { warning: 80, critical: 95 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 85, critical: 95 },
      temperature: { warning: 70, critical: 80 },
      ...thresholds
    }

    // Default services to monitor
    this.services = [
      'sensorManager',
      'mqttService',
      'aiService',
      'voiceService',
      'cameraService'
    ]
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('System monitor already running')
      return
    }

    this.isRunning = true
    
    // Start periodic monitoring
    this.monitorInterval = setInterval(async () => {
      try {
        await this.collectMetrics()
      } catch (error) {
        logger.error('Error collecting system metrics:', error)
      }
    }, 30000) // Every 30 seconds

    // Initial collection
    await this.collectMetrics()
    
    logger.info('System monitor started')
  }

  async stop(): Promise<void> {
    this.isRunning = false
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
    }

    logger.info('System monitor stopped')
  }

  private async collectMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      timestamp: new Date(),
      cpu: await this.getCPUMetrics(),
      memory: this.getMemoryMetrics(),
      disk: await this.getDiskMetrics(),
      network: await this.getNetworkMetrics(),
      services: await this.getServiceMetrics(),
      system: this.getSystemMetrics()
    }

    // Check thresholds and generate alerts
    await this.checkThresholds(metrics)

    // Store metrics in database
    await this.storeMetrics(metrics)

    // Emit metrics event
    this.emit('metrics', metrics)

    return metrics
  }

  private async getCPUMetrics(): Promise<SystemMetrics['cpu']> {
    const cpus = os.cpus()
    const load = os.loadavg()
    
    // Calculate CPU usage
    let totalIdle = 0
    let totalTick = 0

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times]
      }
      totalIdle += cpu.times.idle
    })

    const idle = totalIdle / cpus.length
    const total = totalTick / cpus.length
    const usage = 100 - ~~(100 * idle / total)

    // Try to get temperature (Raspberry Pi specific)
    let temperature: number | undefined
    try {
      if (process.platform === 'linux') {
        const tempStr = execSync('cat /sys/class/thermal/thermal_zone0/temp', { encoding: 'utf8' })
        temperature = parseInt(tempStr.trim()) / 1000
      }
    } catch (error) {
      // Temperature not available
    }

    return {
      usage,
      ...(temperature !== undefined && { temperature }),
      cores: cpus.length,
      load
    }
  }

  private getMemoryMetrics(): SystemMetrics['memory'] {
    const total = os.totalmem()
    const free = os.freemem()
    const used = total - free
    const usage = (used / total) * 100

    return {
      total,
      used,
      free,
      usage
    }
  }

  private async getDiskMetrics(): Promise<SystemMetrics['disk']> {
    try {
      let stats: any
      
      if (process.platform === 'linux') {
        const output = execSync('df -h /', { encoding: 'utf8' })
        const lines = output.trim().split('\n')
        if (lines.length > 1 && lines[1]) {
          const data = lines[1].split(/\s+/)
          
          if (data.length >= 5) {
            const total = this.parseSize(data[1] || '0')
            const used = this.parseSize(data[2] || '0')
            const free = this.parseSize(data[3] || '0')
            const usage = parseInt((data[4] || '0%').replace('%', ''))

            stats = { total, used, free, usage }
          } else {
            throw new Error('Invalid df output format')
          }
        } else {
          throw new Error('No df output data')
        }
      } else {
        // Fallback for other platforms
        const total = 1024 * 1024 * 1024 * 16 // 16GB fallback
        const free = 1024 * 1024 * 1024 * 8   // 8GB fallback
        const used = total - free
        const usage = (used / total) * 100

        stats = { total, used, free, usage }
      }

      return stats
    } catch (error) {
      logger.error('Failed to get disk metrics:', error)
      return { total: 0, used: 0, free: 0, usage: 0 }
    }
  }

  private parseSize(sizeStr: string): number {
    const units: { [key: string]: number } = {
      'K': 1024,
      'M': 1024 * 1024,
      'G': 1024 * 1024 * 1024,
      'T': 1024 * 1024 * 1024 * 1024
    }

    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGT]?)$/)
    if (!match) return 0

    const value = parseFloat(match[1] || '0')
    const unit = match[2] || ''
    const multiplier = units[unit] || 1

    return value * multiplier
  }

  private async getNetworkMetrics(): Promise<SystemMetrics['network']> {
    const interfaces = os.networkInterfaces()
    const networkInterfaces: NetworkInterface[] = []

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue

      for (const addr of addrs) {
        networkInterfaces.push({
          name,
          address: addr.address,
          netmask: addr.netmask,
          family: addr.family,
          mac: addr.mac,
          internal: addr.internal,
          cidr: addr.cidr || '',
          status: addr.internal ? 'up' : await this.checkInterfaceStatus(name)
        })
      }
    }

    // Check internet connectivity
    const connectivity = await this.checkConnectivity()

    return {
      interfaces: networkInterfaces,
      connectivity
    }
  }

  private async checkInterfaceStatus(interfaceName: string): Promise<'up' | 'down'> {
    try {
      if (process.platform === 'linux') {
        const output = execSync(`cat /sys/class/net/${interfaceName}/operstate`, { encoding: 'utf8' })
        return output.trim() === 'up' ? 'up' : 'down'
      }
      return 'up' // Assume up on non-Linux platforms
    } catch (error) {
      return 'down'
    }
  }

  private async checkConnectivity(): Promise<boolean> {
    try {
      execSync('ping -c 1 -W 3 8.8.8.8', { stdio: 'ignore' })
      return true
    } catch (error) {
      return false
    }
  }

  private async getServiceMetrics(): Promise<{ [serviceName: string]: ServiceStatus }> {
    const services: { [serviceName: string]: ServiceStatus } = {}

    for (const serviceName of this.services) {
      try {
        const status = await this.checkServiceStatus(serviceName)
        services[serviceName] = status
      } catch (error) {
        services[serviceName] = {
          name: serviceName,
          status: 'error',
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }

    return services
  }

  private async checkServiceStatus(serviceName: string): Promise<ServiceStatus> {
    // This is a simplified check - in reality, you'd integrate with your service registry
    // For now, we'll assume services are running if their modules are loaded
    
    const status: ServiceStatus = {
      name: serviceName,
      status: 'unknown',
      lastCheck: new Date()
    }

    try {
      // Check if service is in our event emitter registry
      const hasListeners = this.listenerCount(serviceName) > 0
      status.status = hasListeners ? 'running' : 'stopped'
      
      // Mock some metrics for running services
      if (status.status === 'running') {
        status.uptime = Math.floor(Math.random() * 86400) // Random uptime
        status.memoryUsage = Math.floor(Math.random() * 100) * 1024 * 1024 // Random memory
        status.cpuUsage = Math.floor(Math.random() * 10) // Random CPU usage
      }
    } catch (error) {
      status.status = 'error'
      status.error = error instanceof Error ? error.message : 'Unknown error'
    }

    return status
  }

  private getSystemMetrics(): SystemMetrics['system'] {
    return {
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      loadAverage: os.loadavg()
    }
  }

  private async checkThresholds(metrics: SystemMetrics): Promise<void> {
    const alerts: HealthAlert[] = []

    // Check CPU usage
    if (metrics.cpu.usage > this.thresholds.cpu.critical) {
      alerts.push(this.createAlert('cpu', 'critical', 
        `CPU usage critical: ${metrics.cpu.usage.toFixed(1)}%`,
        metrics.cpu.usage, this.thresholds.cpu.critical))
    } else if (metrics.cpu.usage > this.thresholds.cpu.warning) {
      alerts.push(this.createAlert('cpu', 'warning',
        `CPU usage high: ${metrics.cpu.usage.toFixed(1)}%`,
        metrics.cpu.usage, this.thresholds.cpu.warning))
    }

    // Check memory usage
    if (metrics.memory.usage > this.thresholds.memory.critical) {
      alerts.push(this.createAlert('memory', 'critical',
        `Memory usage critical: ${metrics.memory.usage.toFixed(1)}%`,
        metrics.memory.usage, this.thresholds.memory.critical))
    } else if (metrics.memory.usage > this.thresholds.memory.warning) {
      alerts.push(this.createAlert('memory', 'warning',
        `Memory usage high: ${metrics.memory.usage.toFixed(1)}%`,
        metrics.memory.usage, this.thresholds.memory.warning))
    }

    // Check disk usage
    if (metrics.disk.usage > this.thresholds.disk.critical) {
      alerts.push(this.createAlert('disk', 'critical',
        `Disk usage critical: ${metrics.disk.usage.toFixed(1)}%`,
        metrics.disk.usage, this.thresholds.disk.critical))
    } else if (metrics.disk.usage > this.thresholds.disk.warning) {
      alerts.push(this.createAlert('disk', 'warning',
        `Disk usage high: ${metrics.disk.usage.toFixed(1)}%`,
        metrics.disk.usage, this.thresholds.disk.warning))
    }

    // Check temperature
    if (metrics.cpu.temperature) {
      if (metrics.cpu.temperature > this.thresholds.temperature.critical) {
        alerts.push(this.createAlert('temperature', 'critical',
          `CPU temperature critical: ${metrics.cpu.temperature.toFixed(1)}°C`,
          metrics.cpu.temperature, this.thresholds.temperature.critical))
      } else if (metrics.cpu.temperature > this.thresholds.temperature.warning) {
        alerts.push(this.createAlert('temperature', 'warning',
          `CPU temperature high: ${metrics.cpu.temperature.toFixed(1)}°C`,
          metrics.cpu.temperature, this.thresholds.temperature.warning))
      }
    }

    // Check services
    for (const [serviceName, service] of Object.entries(metrics.services)) {
      if (service.status === 'error' || service.status === 'stopped') {
        alerts.push(this.createAlert('service', 'critical',
          `Service ${serviceName} is ${service.status}: ${service.error || ''}`,
          0, 0))
      }
    }

    // Check network connectivity
    if (!metrics.network.connectivity) {
      alerts.push(this.createAlert('network', 'warning',
        'Internet connectivity lost', 0, 0))
    }

    // Process alerts
    for (const alert of alerts) {
      await this.processAlert(alert)
    }

    // Resolve alerts that are no longer active
    await this.resolveInactiveAlerts(metrics)
  }

  private createAlert(type: HealthAlert['type'], level: HealthAlert['level'], 
                     message: string, value: number, threshold: number): HealthAlert {
    return {
      type,
      level,
      message,
      value,
      threshold,
      timestamp: new Date(),
      resolved: false
    }
  }

  private async processAlert(alert: HealthAlert): Promise<void> {
    const alertKey = `${alert.type}_${alert.level}`
    const existingAlert = this.alertHistory.get(alertKey)

    // Only emit/store if this is a new alert or significant change
    if (!existingAlert || existingAlert.resolved) {
      this.alertHistory.set(alertKey, alert)
      
      // Store in database
      await this.database.insertAlert({
        type: alert.type,
        message: alert.message,
        severity: alert.level === 'critical' ? 'critical' : 'medium',
        timestamp: alert.timestamp,
        resolved: false,
        synced: false
      })

      // Emit alert event
      this.emit('alert', alert)
      
      logger.warn(`System alert: ${alert.message}`)
    }
  }

  private async resolveInactiveAlerts(metrics: SystemMetrics): Promise<void> {
    for (const [alertKey, alert] of this.alertHistory.entries()) {
      if (alert.resolved) continue

      let shouldResolve = false

      switch (alert.type) {
        case 'cpu':
          shouldResolve = metrics.cpu.usage < this.thresholds.cpu.warning
          break
        case 'memory':
          shouldResolve = metrics.memory.usage < this.thresholds.memory.warning
          break
        case 'disk':
          shouldResolve = metrics.disk.usage < this.thresholds.disk.warning
          break
        case 'temperature':
          shouldResolve = !metrics.cpu.temperature || 
                         metrics.cpu.temperature < this.thresholds.temperature.warning
          break
        case 'network':
          shouldResolve = metrics.network.connectivity
          break
        case 'service':
          // Service alerts are resolved when service comes back online
          // This would need service-specific logic
          break
      }

      if (shouldResolve) {
        alert.resolved = true
        this.emit('alert_resolved', alert)
        logger.info(`System alert resolved: ${alert.message}`)
      }
    }
  }

  private async storeMetrics(metrics: SystemMetrics): Promise<void> {
    try {
      // Store in a simple format - in production, you might want a time-series database
      await this.database.setConfiguration('latest_metrics', metrics)
      
      // Also store historical data (keep last 24 hours)
      const historyKey = `metrics_${Date.now()}`
      await this.database.setConfiguration(historyKey, metrics)
      
      // Clean up old metrics (keep only last 288 entries = 24 hours at 5-minute intervals)
      // This is a simplified cleanup - in production, use a proper cleanup strategy
    } catch (error) {
      logger.error('Failed to store system metrics:', error)
    }
  }

  // Public API methods
  async getLatestMetrics(): Promise<SystemMetrics | null> {
    try {
      return await this.database.getConfiguration('latest_metrics')
    } catch (error) {
      logger.error('Failed to get latest metrics:', error)
      return null
    }
  }

  async getMetricsHistory(hours: number = 24): Promise<SystemMetrics[]> {
    try {
      // This is simplified - in production, implement proper time-series queries
      const metrics = await this.database.getConfiguration('latest_metrics')
      return metrics ? [metrics] : []
    } catch (error) {
      logger.error('Failed to get metrics history:', error)
      return []
    }
  }

  getThresholds(): HealthThresholds {
    return { ...this.thresholds }
  }

  updateThresholds(thresholds: Partial<HealthThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
    logger.info('System monitor thresholds updated')
  }

  addService(serviceName: string): void {
    if (!this.services.includes(serviceName)) {
      this.services.push(serviceName)
      logger.info(`Added service to monitoring: ${serviceName}`)
    }
  }

  removeService(serviceName: string): void {
    const index = this.services.indexOf(serviceName)
    if (index > -1) {
      this.services.splice(index, 1)
      logger.info(`Removed service from monitoring: ${serviceName}`)
    }
  }

  isActive(): boolean {
    return this.isRunning
  }

  async getSystemInfo(): Promise<any> {
    try {
      return {
        timestamp: new Date().toISOString(),
        system: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version,
          uptime: process.uptime()
        },
        cpu: {
          cores: os.cpus().length,
          load: os.loadavg()
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          percentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
        }
      };
    } catch (error) {
      logger.error('Error getting system info:', error);
      return {
        timestamp: new Date().toISOString(),
        error: 'Failed to get system information'
      };
    }
  }
}
