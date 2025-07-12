"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardBridge = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
class DashboardBridge extends events_1.EventEmitter {
    constructor(io, database, mqttService, sensorManager) {
        super();
        this.connectedClients = new Map();
        this.subscriptions = new Map();
        this.isRunning = false;
        this.io = io;
        this.database = database;
        this.mqttService = mqttService;
        this.sensorManager = sensorManager;
    }
    async start() {
        try {
            this.isRunning = true;
            this.setupSocketHandlers();
            this.setupDataStreams();
            this.startHealthMonitoring();
            logger_1.logger.info('Dashboard Bridge started');
        }
        catch (error) {
            logger_1.logger.error('Failed to start Dashboard Bridge:', error);
            throw error;
        }
    }
    async stop() {
        this.isRunning = false;
        this.connectedClients.clear();
        this.subscriptions.clear();
        logger_1.logger.info('Dashboard Bridge stopped');
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            logger_1.logger.info(`Dashboard client connected: ${socket.id}`);
            socket.on('dashboard_auth', async (authData) => {
                await this.handleClientAuth(socket, authData);
            });
            socket.on('subscribe_farms', (farmIds) => {
                this.handleFarmSubscription(socket, farmIds);
            });
            socket.on('subscribe_sensors', (sensorIds) => {
                this.handleSensorSubscription(socket, sensorIds);
            });
            socket.on('dashboard_query', async (query) => {
                await this.handleDashboardQuery(socket, query);
            });
            socket.on('device_command', async (command) => {
                await this.handleDeviceCommand(socket, command);
            });
            socket.on('disconnect', () => {
                this.handleClientDisconnect(socket);
            });
            socket.emit('connection_status', {
                connected: true,
                timestamp: new Date(),
                services: {
                    database: this.database.isConnected,
                    mqtt: this.mqttService.isConnected,
                    sensors: this.sensorManager.isActive
                }
            });
        });
    }
    async handleClientAuth(socket, authData) {
        try {
            const isValid = await this.validateAuthToken(authData.token);
            if (!isValid) {
                socket.emit('auth_error', { error: 'Invalid authentication token' });
                socket.disconnect();
                return;
            }
            const client = {
                id: socket.id,
                userId: authData.userId,
                farmIds: authData.farmIds || [],
                permissions: authData.permissions || [],
                connectedAt: new Date(),
                lastSeen: new Date()
            };
            this.connectedClients.set(socket.id, client);
            socket.emit('auth_success', {
                clientId: socket.id,
                permissions: client.permissions
            });
            logger_1.logger.info(`Dashboard client authenticated: ${authData.userId}`);
        }
        catch (error) {
            logger_1.logger.error('Client authentication error:', error);
            socket.emit('auth_error', { error: 'Authentication failed' });
        }
    }
    handleFarmSubscription(socket, farmIds) {
        const client = this.connectedClients.get(socket.id);
        if (!client)
            return;
        client.farmIds = farmIds;
        this.subscriptions.set(socket.id, new Set(farmIds));
        farmIds.forEach(farmId => {
            socket.join(`farm_${farmId}`);
        });
        socket.emit('subscription_confirmed', { farmIds });
        logger_1.logger.debug(`Client ${socket.id} subscribed to farms: ${farmIds.join(', ')}`);
    }
    handleSensorSubscription(socket, sensorIds) {
        sensorIds.forEach(sensorId => {
            socket.join(`sensor_${sensorId}`);
        });
        socket.emit('sensor_subscription_confirmed', { sensorIds });
        logger_1.logger.debug(`Client ${socket.id} subscribed to sensors: ${sensorIds.join(', ')}`);
    }
    async handleDashboardQuery(socket, query) {
        try {
            const client = this.connectedClients.get(socket.id);
            if (!client)
                return;
            let result;
            switch (query.type) {
                case 'sensor_data':
                    result = await this.getSensorData(query, client);
                    break;
                case 'alerts':
                    result = await this.getAlerts(query, client);
                    break;
                case 'farm_status':
                    result = await this.getFarmStatus(query, client);
                    break;
                case 'system_health':
                    result = await this.getSystemHealth(query, client);
                    break;
                default:
                    result = { error: 'Unknown query type' };
            }
            socket.emit('query_response', {
                queryId: query.id,
                result
            });
        }
        catch (error) {
            logger_1.logger.error('Dashboard query error:', error);
            socket.emit('query_error', {
                queryId: query.id,
                error: error instanceof Error ? error.message : 'Query failed'
            });
        }
    }
    async handleDeviceCommand(socket, command) {
        try {
            const client = this.connectedClients.get(socket.id);
            if (!client || !client.permissions.includes('device_control')) {
                socket.emit('command_error', { error: 'Insufficient permissions' });
                return;
            }
            const topic = `soilwise/commands/${command.deviceId}`;
            await this.mqttService.publish(topic, JSON.stringify(command));
            socket.emit('command_sent', {
                commandId: command.id,
                deviceId: command.deviceId,
                timestamp: new Date()
            });
            logger_1.logger.info(`Device command sent: ${command.type} to ${command.deviceId}`);
        }
        catch (error) {
            logger_1.logger.error('Device command error:', error);
            socket.emit('command_error', {
                commandId: command.id,
                error: error instanceof Error ? error.message : 'Command failed'
            });
        }
    }
    handleClientDisconnect(socket) {
        const client = this.connectedClients.get(socket.id);
        if (client) {
            this.connectedClients.delete(socket.id);
            this.subscriptions.delete(socket.id);
            logger_1.logger.info(`Dashboard client disconnected: ${socket.id}`);
        }
    }
    setupDataStreams() {
        this.sensorManager.on('sensorData', (data) => {
            this.broadcastSensorUpdate(data);
        });
        this.mqttService.on('message', (topic, message) => {
            this.handleMQTTMessage(topic, message);
        });
        this.on('alert_created', (alert) => {
            this.broadcastAlert(alert);
        });
        this.on('system_status', (status) => {
            this.broadcastSystemStatus(status);
        });
    }
    broadcastSensorUpdate(sensorData) {
        const update = {
            type: 'sensor_data',
            data: sensorData,
            timestamp: new Date(),
            sensorId: sensorData.sensorId,
            farmId: sensorData.farmId
        };
        this.io.to(`sensor_${sensorData.sensorId}`).emit('real_time_update', update);
        if (sensorData.farmId) {
            this.io.to(`farm_${sensorData.farmId}`).emit('real_time_update', update);
        }
    }
    broadcastAlert(alert) {
        const update = {
            type: 'alert',
            data: alert,
            timestamp: new Date(),
            farmId: alert.farmId,
            sensorId: alert.sensorId
        };
        if (alert.farmId) {
            this.io.to(`farm_${alert.farmId}`).emit('real_time_update', update);
        }
        else {
            this.io.emit('real_time_update', update);
        }
    }
    broadcastSystemStatus(status) {
        const update = {
            type: 'system_health',
            data: status,
            timestamp: new Date()
        };
        this.io.emit('real_time_update', update);
    }
    handleMQTTMessage(topic, message) {
        if (topic.startsWith('soilwise/alerts/')) {
            const alert = JSON.parse(message.toString());
            this.broadcastAlert(alert);
        }
        else if (topic.startsWith('soilwise/system/')) {
            const systemData = JSON.parse(message.toString());
            this.broadcastSystemStatus(systemData);
        }
    }
    async getSensorData(query, client) {
        if (!this.hasAccess(client, query.farmId)) {
            throw new Error('Access denied');
        }
        const limit = Math.min(query.limit || 100, 1000);
        const sensorId = query.sensorId;
        return await this.database.getSensorData(sensorId, limit);
    }
    async getAlerts(query, client) {
        if (query.farmId && !this.hasAccess(client, query.farmId)) {
            throw new Error('Access denied');
        }
        const limit = Math.min(query.limit || 50, 500);
        return await this.database.getAlerts(limit);
    }
    async getFarmStatus(query, client) {
        if (!this.hasAccess(client, query.farmId)) {
            throw new Error('Access denied');
        }
        return {
            farmId: query.farmId,
            sensors: await this.getActiveSensors(query.farmId),
            alerts: await this.getActiveAlerts(query.farmId),
            lastUpdate: new Date()
        };
    }
    async getSystemHealth(query, client) {
        if (!client.permissions.includes('system_monitoring')) {
            throw new Error('Insufficient permissions');
        }
        return {
            services: {
                database: this.database.isConnected,
                mqtt: this.mqttService.isConnected,
                sensors: this.sensorManager.isActive
            },
            connectedClients: this.connectedClients.size,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date()
        };
    }
    hasAccess(client, farmId) {
        return client.farmIds.includes(farmId) || client.permissions.includes('admin');
    }
    async getActiveSensors(farmId) {
        return [];
    }
    async getActiveAlerts(farmId) {
        return [];
    }
    async validateAuthToken(token) {
        return !!token && token.length > 0;
    }
    startHealthMonitoring() {
        setInterval(() => {
            if (this.isRunning && this.connectedClients.size > 0) {
                const healthStatus = {
                    services: {
                        database: this.database.isConnected,
                        mqtt: this.mqttService.isConnected,
                        sensors: this.sensorManager.isActive
                    },
                    timestamp: new Date()
                };
                this.broadcastSystemStatus(healthStatus);
            }
        }, 30000);
    }
    getStatus() {
        return {
            isRunning: this.isRunning,
            connectedClients: this.connectedClients.size,
            clients: Array.from(this.connectedClients.values()),
            subscriptions: Object.fromEntries(this.subscriptions)
        };
    }
    disconnectClient(clientId) {
        const socket = this.io.sockets.sockets.get(clientId);
        if (socket) {
            socket.disconnect();
            logger_1.logger.info(`Force disconnected client: ${clientId}`);
        }
    }
    broadcastToFarm(farmId, message) {
        this.io.to(`farm_${farmId}`).emit('farm_broadcast', message);
    }
    broadcastToAll(message) {
        this.io.emit('global_broadcast', message);
    }
}
exports.DashboardBridge = DashboardBridge;
//# sourceMappingURL=dashboardBridge.js.map