"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PWASyncBridge = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
class PWASyncBridge extends events_1.EventEmitter {
    constructor(database, mqttService) {
        super();
        this.isRunning = false;
        this.syncInterval = null;
        this.connectedDevices = new Map();
        this.database = database;
        this.mqttService = mqttService;
    }
    async start() {
        try {
            this.isRunning = true;
            this.setupMQTTHandlers();
            this.startPeriodicSync();
            logger_1.logger.info('PWA Sync Bridge started');
        }
        catch (error) {
            logger_1.logger.error('Failed to start PWA Sync Bridge:', error);
            throw error;
        }
    }
    async stop() {
        this.isRunning = false;
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        this.connectedDevices.clear();
        logger_1.logger.info('PWA Sync Bridge stopped');
    }
    setupMQTTHandlers() {
        this.mqttService.on('message', async (topic, message) => {
            if (topic.startsWith('soilwise/pwa/sync/request')) {
                await this.handleSyncRequest(topic, message);
            }
            else if (topic.startsWith('soilwise/pwa/device/connect')) {
                await this.handleDeviceConnect(topic, message);
            }
            else if (topic.startsWith('soilwise/pwa/device/disconnect')) {
                await this.handleDeviceDisconnect(topic, message);
            }
        });
    }
    async handleSyncRequest(topic, message) {
        try {
            const request = JSON.parse(message.toString());
            const response = await this.processSyncRequest(request);
            const responseTopic = `soilwise/pwa/sync/response/${request.deviceId}`;
            await this.mqttService.publish(responseTopic, JSON.stringify(response));
            logger_1.logger.info(`Sync request processed for device ${request.deviceId}`);
        }
        catch (error) {
            logger_1.logger.error('Error handling sync request:', error);
        }
    }
    async processSyncRequest(request) {
        try {
            if (request.type === 'full') {
                return await this.processFullSync(request);
            }
            else {
                return await this.processIncrementalSync(request);
            }
        }
        catch (error) {
            logger_1.logger.error('Sync request processing failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date()
            };
        }
    }
    async processFullSync(request) {
        const data = {
            farms: await this.database.getFarms(),
            fields: await this.database.getFields(),
            observations: [],
            sensorReadings: await this.database.getSensorData('', 1000),
            tasks: [],
            photos: [],
            notes: []
        };
        return {
            success: true,
            data,
            timestamp: new Date()
        };
    }
    async processIncrementalSync(request) {
        if (!request.lastSync) {
            return this.processFullSync(request);
        }
        const data = {
            farms: await this.database.getFarmsModifiedSince(request.lastSync),
            fields: await this.database.getFieldsModifiedSince(request.lastSync),
            observations: [],
            sensorReadings: await this.database.getSensorDataSince(request.lastSync),
            tasks: [],
            photos: [],
            notes: []
        };
        return {
            success: true,
            data,
            timestamp: new Date()
        };
    }
    async handleDeviceConnect(topic, message) {
        try {
            const deviceInfo = JSON.parse(message.toString());
            this.connectedDevices.set(deviceInfo.deviceId, {
                ...deviceInfo,
                connectedAt: new Date(),
                lastSeen: new Date()
            });
            logger_1.logger.info(`PWA device connected: ${deviceInfo.deviceId}`);
            this.emit('device_connected', deviceInfo);
        }
        catch (error) {
            logger_1.logger.error('Error handling device connect:', error);
        }
    }
    async handleDeviceDisconnect(topic, message) {
        try {
            const { deviceId } = JSON.parse(message.toString());
            this.connectedDevices.delete(deviceId);
            logger_1.logger.info(`PWA device disconnected: ${deviceId}`);
            this.emit('device_disconnected', { deviceId });
        }
        catch (error) {
            logger_1.logger.error('Error handling device disconnect:', error);
        }
    }
    startPeriodicSync() {
        this.syncInterval = setInterval(async () => {
            if (this.connectedDevices.size > 0) {
                await this.broadcastUpdates();
            }
        }, 5 * 60 * 1000);
    }
    async broadcastUpdates() {
        try {
            const recentData = await this.database.getSensorDataSince(new Date(Date.now() - 5 * 60 * 1000));
            if (recentData.length > 0) {
                const updateMessage = {
                    type: 'sensor_update',
                    data: recentData,
                    timestamp: new Date()
                };
                for (const deviceId of this.connectedDevices.keys()) {
                    const topic = `soilwise/pwa/updates/${deviceId}`;
                    await this.mqttService.publish(topic, JSON.stringify(updateMessage));
                }
                logger_1.logger.debug(`Broadcasted updates to ${this.connectedDevices.size} devices`);
            }
        }
        catch (error) {
            logger_1.logger.error('Error broadcasting updates:', error);
        }
    }
    async receiveDataFromPWA(deviceId, data) {
        try {
            if (data.fields) {
                await this.processPWAFields(data.fields);
            }
            if (data.observations) {
                await this.processPWAObservations(data.observations);
            }
            if (data.photos) {
                await this.processPWAPhotos(data.photos);
            }
            if (data.tasks) {
                await this.processPWATasks(data.tasks);
            }
            logger_1.logger.info(`Processed data from PWA device ${deviceId}`);
            this.emit('pwa_data_received', { deviceId, data });
        }
        catch (error) {
            logger_1.logger.error('Error processing PWA data:', error);
            throw error;
        }
    }
    async processPWAFields(fields) {
        for (const field of fields) {
            try {
                const existing = await this.database.getFieldById(field.id);
                if (existing) {
                    await this.database.updateField(field.id, field);
                }
                else {
                    await this.database.insertField(field);
                }
            }
            catch (error) {
                logger_1.logger.error(`Error processing field ${field.id}:`, error);
            }
        }
    }
    async processPWAObservations(observations) {
        for (const observation of observations) {
            try {
                await this.database.insertObservation(observation);
            }
            catch (error) {
                logger_1.logger.error(`Error processing observation ${observation.id}:`, error);
            }
        }
    }
    async processPWAPhotos(photos) {
        for (const photo of photos) {
            try {
                await this.database.insertPhoto(photo);
                this.emit('photo_received', photo);
            }
            catch (error) {
                logger_1.logger.error(`Error processing photo ${photo.id}:`, error);
            }
        }
    }
    async processPWATasks(tasks) {
        for (const task of tasks) {
            try {
                await this.database.insertTask(task);
            }
            catch (error) {
                logger_1.logger.error(`Error processing task ${task.id}:`, error);
            }
        }
    }
    getSyncStatus() {
        return {
            isRunning: this.isRunning,
            connectedDevices: this.connectedDevices.size,
            devices: Array.from(this.connectedDevices.values()),
            lastBroadcast: this.syncInterval ? new Date() : null
        };
    }
    async forceSyncDevice(deviceId) {
        const device = this.connectedDevices.get(deviceId);
        if (!device) {
            throw new Error(`Device ${deviceId} not connected`);
        }
        const syncRequest = {
            type: 'full',
            deviceId,
            userId: device.userId
        };
        const response = await this.processSyncRequest(syncRequest);
        const topic = `soilwise/pwa/sync/forced/${deviceId}`;
        await this.mqttService.publish(topic, JSON.stringify(response));
        logger_1.logger.info(`Forced sync initiated for device ${deviceId}`);
    }
}
exports.PWASyncBridge = PWASyncBridge;
//# sourceMappingURL=pwaSyncBridge.js.map