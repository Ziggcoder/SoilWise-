"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMonitor = void 0;
const events_1 = require("events");
const child_process_1 = require("child_process");
const os = __importStar(require("os"));
const logger_1 = require("../utils/logger");
class SystemMonitor extends events_1.EventEmitter {
    constructor(database, thresholds) {
        super();
        this.isRunning = false;
        this.monitorInterval = null;
        this.alertHistory = new Map();
        this.services = [];
        this.database = database;
        this.thresholds = {
            cpu: { warning: 80, critical: 95 },
            memory: { warning: 80, critical: 95 },
            disk: { warning: 85, critical: 95 },
            temperature: { warning: 70, critical: 80 },
            ...thresholds
        };
        this.services = [
            'sensorManager',
            'mqttService',
            'aiService',
            'voiceService',
            'cameraService'
        ];
    }
    async start() {
        if (this.isRunning) {
            logger_1.logger.warn('System monitor already running');
            return;
        }
        this.isRunning = true;
        this.monitorInterval = setInterval(async () => {
            try {
                await this.collectMetrics();
            }
            catch (error) {
                logger_1.logger.error('Error collecting system metrics:', error);
            }
        }, 30000);
        await this.collectMetrics();
        logger_1.logger.info('System monitor started');
    }
    async stop() {
        this.isRunning = false;
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        logger_1.logger.info('System monitor stopped');
    }
    async collectMetrics() {
        const metrics = {
            timestamp: new Date(),
            cpu: await this.getCPUMetrics(),
            memory: this.getMemoryMetrics(),
            disk: await this.getDiskMetrics(),
            network: await this.getNetworkMetrics(),
            services: await this.getServiceMetrics(),
            system: this.getSystemMetrics()
        };
        await this.checkThresholds(metrics);
        await this.storeMetrics(metrics);
        this.emit('metrics', metrics);
        return metrics;
    }
    async getCPUMetrics() {
        const cpus = os.cpus();
        const load = os.loadavg();
        let totalIdle = 0;
        let totalTick = 0;
        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        const usage = 100 - ~~(100 * idle / total);
        let temperature;
        try {
            if (process.platform === 'linux') {
                const tempStr = (0, child_process_1.execSync)('cat /sys/class/thermal/thermal_zone0/temp', { encoding: 'utf8' });
                temperature = parseInt(tempStr.trim()) / 1000;
            }
        }
        catch (error) {
        }
        return {
            usage,
            ...(temperature !== undefined && { temperature }),
            cores: cpus.length,
            load
        };
    }
    getMemoryMetrics() {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;
        const usage = (used / total) * 100;
        return {
            total,
            used,
            free,
            usage
        };
    }
    async getDiskMetrics() {
        try {
            let stats;
            if (process.platform === 'linux') {
                const output = (0, child_process_1.execSync)('df -h /', { encoding: 'utf8' });
                const lines = output.trim().split('\n');
                if (lines.length > 1 && lines[1]) {
                    const data = lines[1].split(/\s+/);
                    if (data.length >= 5) {
                        const total = this.parseSize(data[1] || '0');
                        const used = this.parseSize(data[2] || '0');
                        const free = this.parseSize(data[3] || '0');
                        const usage = parseInt((data[4] || '0%').replace('%', ''));
                        stats = { total, used, free, usage };
                    }
                    else {
                        throw new Error('Invalid df output format');
                    }
                }
                else {
                    throw new Error('No df output data');
                }
            }
            else {
                const total = 1024 * 1024 * 1024 * 16;
                const free = 1024 * 1024 * 1024 * 8;
                const used = total - free;
                const usage = (used / total) * 100;
                stats = { total, used, free, usage };
            }
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Failed to get disk metrics:', error);
            return { total: 0, used: 0, free: 0, usage: 0 };
        }
    }
    parseSize(sizeStr) {
        const units = {
            'K': 1024,
            'M': 1024 * 1024,
            'G': 1024 * 1024 * 1024,
            'T': 1024 * 1024 * 1024 * 1024
        };
        const match = sizeStr.match(/^(\d+(?:\.\d+)?)([KMGT]?)$/);
        if (!match)
            return 0;
        const value = parseFloat(match[1] || '0');
        const unit = match[2] || '';
        const multiplier = units[unit] || 1;
        return value * multiplier;
    }
    async getNetworkMetrics() {
        const interfaces = os.networkInterfaces();
        const networkInterfaces = [];
        for (const [name, addrs] of Object.entries(interfaces)) {
            if (!addrs)
                continue;
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
                });
            }
        }
        const connectivity = await this.checkConnectivity();
        return {
            interfaces: networkInterfaces,
            connectivity
        };
    }
    async checkInterfaceStatus(interfaceName) {
        try {
            if (process.platform === 'linux') {
                const output = (0, child_process_1.execSync)(`cat /sys/class/net/${interfaceName}/operstate`, { encoding: 'utf8' });
                return output.trim() === 'up' ? 'up' : 'down';
            }
            return 'up';
        }
        catch (error) {
            return 'down';
        }
    }
    async checkConnectivity() {
        try {
            (0, child_process_1.execSync)('ping -c 1 -W 3 8.8.8.8', { stdio: 'ignore' });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async getServiceMetrics() {
        const services = {};
        for (const serviceName of this.services) {
            try {
                const status = await this.checkServiceStatus(serviceName);
                services[serviceName] = status;
            }
            catch (error) {
                services[serviceName] = {
                    name: serviceName,
                    status: 'error',
                    lastCheck: new Date(),
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
            }
        }
        return services;
    }
    async checkServiceStatus(serviceName) {
        const status = {
            name: serviceName,
            status: 'unknown',
            lastCheck: new Date()
        };
        try {
            const hasListeners = this.listenerCount(serviceName) > 0;
            status.status = hasListeners ? 'running' : 'stopped';
            if (status.status === 'running') {
                status.uptime = Math.floor(Math.random() * 86400);
                status.memoryUsage = Math.floor(Math.random() * 100) * 1024 * 1024;
                status.cpuUsage = Math.floor(Math.random() * 10);
            }
        }
        catch (error) {
            status.status = 'error';
            status.error = error instanceof Error ? error.message : 'Unknown error';
        }
        return status;
    }
    getSystemMetrics() {
        return {
            uptime: os.uptime(),
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            loadAverage: os.loadavg()
        };
    }
    async checkThresholds(metrics) {
        const alerts = [];
        if (metrics.cpu.usage > this.thresholds.cpu.critical) {
            alerts.push(this.createAlert('cpu', 'critical', `CPU usage critical: ${metrics.cpu.usage.toFixed(1)}%`, metrics.cpu.usage, this.thresholds.cpu.critical));
        }
        else if (metrics.cpu.usage > this.thresholds.cpu.warning) {
            alerts.push(this.createAlert('cpu', 'warning', `CPU usage high: ${metrics.cpu.usage.toFixed(1)}%`, metrics.cpu.usage, this.thresholds.cpu.warning));
        }
        if (metrics.memory.usage > this.thresholds.memory.critical) {
            alerts.push(this.createAlert('memory', 'critical', `Memory usage critical: ${metrics.memory.usage.toFixed(1)}%`, metrics.memory.usage, this.thresholds.memory.critical));
        }
        else if (metrics.memory.usage > this.thresholds.memory.warning) {
            alerts.push(this.createAlert('memory', 'warning', `Memory usage high: ${metrics.memory.usage.toFixed(1)}%`, metrics.memory.usage, this.thresholds.memory.warning));
        }
        if (metrics.disk.usage > this.thresholds.disk.critical) {
            alerts.push(this.createAlert('disk', 'critical', `Disk usage critical: ${metrics.disk.usage.toFixed(1)}%`, metrics.disk.usage, this.thresholds.disk.critical));
        }
        else if (metrics.disk.usage > this.thresholds.disk.warning) {
            alerts.push(this.createAlert('disk', 'warning', `Disk usage high: ${metrics.disk.usage.toFixed(1)}%`, metrics.disk.usage, this.thresholds.disk.warning));
        }
        if (metrics.cpu.temperature) {
            if (metrics.cpu.temperature > this.thresholds.temperature.critical) {
                alerts.push(this.createAlert('temperature', 'critical', `CPU temperature critical: ${metrics.cpu.temperature.toFixed(1)}°C`, metrics.cpu.temperature, this.thresholds.temperature.critical));
            }
            else if (metrics.cpu.temperature > this.thresholds.temperature.warning) {
                alerts.push(this.createAlert('temperature', 'warning', `CPU temperature high: ${metrics.cpu.temperature.toFixed(1)}°C`, metrics.cpu.temperature, this.thresholds.temperature.warning));
            }
        }
        for (const [serviceName, service] of Object.entries(metrics.services)) {
            if (service.status === 'error' || service.status === 'stopped') {
                alerts.push(this.createAlert('service', 'critical', `Service ${serviceName} is ${service.status}: ${service.error || ''}`, 0, 0));
            }
        }
        if (!metrics.network.connectivity) {
            alerts.push(this.createAlert('network', 'warning', 'Internet connectivity lost', 0, 0));
        }
        for (const alert of alerts) {
            await this.processAlert(alert);
        }
        await this.resolveInactiveAlerts(metrics);
    }
    createAlert(type, level, message, value, threshold) {
        return {
            type,
            level,
            message,
            value,
            threshold,
            timestamp: new Date(),
            resolved: false
        };
    }
    async processAlert(alert) {
        const alertKey = `${alert.type}_${alert.level}`;
        const existingAlert = this.alertHistory.get(alertKey);
        if (!existingAlert || existingAlert.resolved) {
            this.alertHistory.set(alertKey, alert);
            await this.database.insertAlert({
                type: alert.type,
                message: alert.message,
                severity: alert.level === 'critical' ? 'critical' : 'medium',
                timestamp: alert.timestamp,
                resolved: false,
                synced: false
            });
            this.emit('alert', alert);
            logger_1.logger.warn(`System alert: ${alert.message}`);
        }
    }
    async resolveInactiveAlerts(metrics) {
        for (const [alertKey, alert] of this.alertHistory.entries()) {
            if (alert.resolved)
                continue;
            let shouldResolve = false;
            switch (alert.type) {
                case 'cpu':
                    shouldResolve = metrics.cpu.usage < this.thresholds.cpu.warning;
                    break;
                case 'memory':
                    shouldResolve = metrics.memory.usage < this.thresholds.memory.warning;
                    break;
                case 'disk':
                    shouldResolve = metrics.disk.usage < this.thresholds.disk.warning;
                    break;
                case 'temperature':
                    shouldResolve = !metrics.cpu.temperature ||
                        metrics.cpu.temperature < this.thresholds.temperature.warning;
                    break;
                case 'network':
                    shouldResolve = metrics.network.connectivity;
                    break;
                case 'service':
                    break;
            }
            if (shouldResolve) {
                alert.resolved = true;
                this.emit('alert_resolved', alert);
                logger_1.logger.info(`System alert resolved: ${alert.message}`);
            }
        }
    }
    async storeMetrics(metrics) {
        try {
            await this.database.setConfiguration('latest_metrics', metrics);
            const historyKey = `metrics_${Date.now()}`;
            await this.database.setConfiguration(historyKey, metrics);
        }
        catch (error) {
            logger_1.logger.error('Failed to store system metrics:', error);
        }
    }
    async getLatestMetrics() {
        try {
            return await this.database.getConfiguration('latest_metrics');
        }
        catch (error) {
            logger_1.logger.error('Failed to get latest metrics:', error);
            return null;
        }
    }
    async getMetricsHistory(hours = 24) {
        try {
            const metrics = await this.database.getConfiguration('latest_metrics');
            return metrics ? [metrics] : [];
        }
        catch (error) {
            logger_1.logger.error('Failed to get metrics history:', error);
            return [];
        }
    }
    getThresholds() {
        return { ...this.thresholds };
    }
    updateThresholds(thresholds) {
        this.thresholds = { ...this.thresholds, ...thresholds };
        logger_1.logger.info('System monitor thresholds updated');
    }
    addService(serviceName) {
        if (!this.services.includes(serviceName)) {
            this.services.push(serviceName);
            logger_1.logger.info(`Added service to monitoring: ${serviceName}`);
        }
    }
    removeService(serviceName) {
        const index = this.services.indexOf(serviceName);
        if (index > -1) {
            this.services.splice(index, 1);
            logger_1.logger.info(`Removed service from monitoring: ${serviceName}`);
        }
    }
    isActive() {
        return this.isRunning;
    }
    async getSystemInfo() {
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
        }
        catch (error) {
            logger_1.logger.error('Error getting system info:', error);
            return {
                timestamp: new Date().toISOString(),
                error: 'Failed to get system information'
            };
        }
    }
}
exports.SystemMonitor = SystemMonitor;
//# sourceMappingURL=systemMonitor.js.map