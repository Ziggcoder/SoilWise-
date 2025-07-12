"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudBridge = void 0;
const events_1 = require("events");
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
class CloudBridge extends events_1.EventEmitter {
    constructor(database, config) {
        super();
        this.syncInterval = null;
        this.isRunning = false;
        this.database = database;
        this.config = {
            endpoint: process.env.CLOUD_SYNC_ENDPOINT || 'https://api.soilwise.com',
            apiKey: process.env.CLOUD_API_KEY || undefined,
            timeout: parseInt(process.env.CLOUD_TIMEOUT || '30000'),
            retryAttempts: parseInt(process.env.CLOUD_RETRY_ATTEMPTS || '3'),
            retryDelay: parseInt(process.env.CLOUD_RETRY_DELAY || '5000'),
            syncInterval: parseInt(process.env.CLOUD_SYNC_INTERVAL || '300000'),
            batchSize: parseInt(process.env.CLOUD_BATCH_SIZE || '100'),
            ...config
        };
        this.apiClient = axios_1.default.create({
            baseURL: this.config.endpoint,
            timeout: this.config.timeout,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'SoilWise-EdgeHub/1.0.0',
                ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
            }
        });
        this.status = {
            lastSync: null,
            isOnline: false,
            isSyncing: false,
            pendingUploads: 0,
            failedUploads: 0,
            totalSynced: 0
        };
        this.setupInterceptors();
    }
    async start() {
        try {
            this.isRunning = true;
            await this.loadSyncStatus();
            await this.checkConnectivity();
            this.startPeriodicSync();
            logger_1.logger.info('Cloud Bridge started');
        }
        catch (error) {
            logger_1.logger.error('Failed to start Cloud Bridge:', error);
            throw error;
        }
    }
    async stop() {
        this.isRunning = false;
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        await this.saveSyncStatus();
        logger_1.logger.info('Cloud Bridge stopped');
    }
    setupInterceptors() {
        this.apiClient.interceptors.request.use((config) => {
            logger_1.logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        }, (error) => {
            logger_1.logger.error('API Request Error:', error);
            return Promise.reject(error);
        });
        this.apiClient.interceptors.response.use((response) => {
            logger_1.logger.debug(`API Response: ${response.status} ${response.config.url}`);
            this.status.isOnline = true;
            return response;
        }, (error) => {
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                this.status.isOnline = false;
                logger_1.logger.warn('Cloud service offline');
            }
            else {
                logger_1.logger.error('API Response Error:', error.message);
            }
            return Promise.reject(error);
        });
    }
    async checkConnectivity() {
        try {
            const response = await this.apiClient.get('/health');
            this.status.isOnline = response.status === 200;
            logger_1.logger.info('Cloud connectivity verified');
        }
        catch (error) {
            this.status.isOnline = false;
            logger_1.logger.warn('Cloud service not reachable');
        }
    }
    startPeriodicSync() {
        this.syncInterval = setInterval(async () => {
            if (this.isRunning && !this.status.isSyncing) {
                try {
                    await this.performSync();
                }
                catch (error) {
                    logger_1.logger.error('Periodic sync failed:', error);
                }
            }
        }, this.config.syncInterval);
    }
    async performSync() {
        if (this.status.isSyncing) {
            logger_1.logger.warn('Sync already in progress, skipping');
            return;
        }
        if (!this.status.isOnline) {
            await this.checkConnectivity();
            if (!this.status.isOnline) {
                logger_1.logger.debug('Skipping sync - cloud service offline');
                return;
            }
        }
        this.status.isSyncing = true;
        logger_1.logger.info('Starting cloud sync');
        try {
            await this.uploadSensorData();
            await this.uploadAlerts();
            await this.uploadFarmData();
            await this.downloadConfigurations();
            await this.downloadUpdates();
            this.status.lastSync = new Date();
            logger_1.logger.info('Cloud sync completed successfully');
            this.emit('sync_completed', this.status);
        }
        catch (error) {
            this.status.lastError = error instanceof Error ? error.message : 'Sync failed';
            logger_1.logger.error('Cloud sync failed:', error);
            this.emit('sync_failed', error);
        }
        finally {
            this.status.isSyncing = false;
            await this.saveSyncStatus();
        }
    }
    async uploadSensorData() {
        try {
            const pendingData = await this.database.getUnsyncedSensorData(this.config.batchSize);
            if (pendingData.length === 0) {
                logger_1.logger.debug('No pending sensor data to upload');
                return;
            }
            for (let i = 0; i < pendingData.length; i += this.config.batchSize) {
                const batch = pendingData.slice(i, i + this.config.batchSize);
                try {
                    await this.uploadBatch({
                        type: 'sensor_data',
                        data: batch,
                        timestamp: new Date()
                    });
                    const ids = batch.map(item => item.id).filter(id => id);
                    await this.database.markSensorDataSynced(ids);
                    this.status.totalSynced += batch.length;
                    logger_1.logger.debug(`Uploaded ${batch.length} sensor readings`);
                }
                catch (error) {
                    this.status.failedUploads += batch.length;
                    logger_1.logger.error(`Failed to upload sensor data batch:`, error);
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Sensor data upload failed:', error);
            throw error;
        }
    }
    async uploadAlerts() {
        try {
            const pendingAlerts = await this.database.getUnsyncedAlerts(this.config.batchSize);
            if (pendingAlerts.length === 0) {
                logger_1.logger.debug('No pending alerts to upload');
                return;
            }
            try {
                await this.uploadBatch({
                    type: 'alerts',
                    data: pendingAlerts,
                    timestamp: new Date()
                });
                const ids = pendingAlerts.map(alert => alert.id).filter(id => id);
                await this.database.markAlertsSynced(ids);
                this.status.totalSynced += pendingAlerts.length;
                logger_1.logger.debug(`Uploaded ${pendingAlerts.length} alerts`);
            }
            catch (error) {
                this.status.failedUploads += pendingAlerts.length;
                logger_1.logger.error('Failed to upload alerts:', error);
            }
        }
        catch (error) {
            logger_1.logger.error('Alert upload failed:', error);
            throw error;
        }
    }
    async uploadFarmData() {
        try {
            const pendingFarms = await this.database.getUnsyncedFarms(this.config.batchSize);
            if (pendingFarms.length === 0) {
                logger_1.logger.debug('No pending farm data to upload');
                return;
            }
            try {
                await this.uploadBatch({
                    type: 'farms',
                    data: pendingFarms,
                    timestamp: new Date()
                });
                const ids = pendingFarms.map(farm => farm.id).filter(id => id);
                await this.database.markFarmsSynced(ids);
                this.status.totalSynced += pendingFarms.length;
                logger_1.logger.debug(`Uploaded ${pendingFarms.length} farm records`);
            }
            catch (error) {
                this.status.failedUploads += pendingFarms.length;
                logger_1.logger.error('Failed to upload farm data:', error);
            }
        }
        catch (error) {
            logger_1.logger.error('Farm data upload failed:', error);
            throw error;
        }
    }
    async uploadBatch(batch) {
        const endpoint = this.getUploadEndpoint(batch.type);
        await this.retryOperation(async () => {
            const response = await this.apiClient.post(endpoint, {
                type: batch.type,
                data: batch.data,
                timestamp: batch.timestamp,
                source: 'edge-hub'
            });
            if (response.status !== 200) {
                throw new Error(`Upload failed with status: ${response.status}`);
            }
            return response.data;
        });
    }
    async downloadConfigurations() {
        try {
            const response = await this.apiClient.get('/configurations', {
                params: {
                    lastSync: this.status.lastSync?.toISOString(),
                    source: 'edge-hub'
                }
            });
            if (response.data && response.data.configurations) {
                for (const config of response.data.configurations) {
                    await this.database.setConfiguration(config.key, config.value);
                }
                logger_1.logger.debug(`Downloaded ${response.data.configurations.length} configurations`);
            }
        }
        catch (error) {
            logger_1.logger.error('Configuration download failed:', error);
        }
    }
    async downloadUpdates() {
        try {
            const response = await this.apiClient.get('/updates', {
                params: {
                    lastSync: this.status.lastSync?.toISOString(),
                    source: 'edge-hub'
                }
            });
            if (response.data && response.data.updates) {
                for (const update of response.data.updates) {
                    await this.processUpdate(update);
                }
                logger_1.logger.debug(`Processed ${response.data.updates.length} updates`);
            }
        }
        catch (error) {
            logger_1.logger.error('Updates download failed:', error);
        }
    }
    async processUpdate(update) {
        switch (update.type) {
            case 'firmware':
                this.emit('firmware_update', update);
                break;
            case 'configuration':
                await this.database.setConfiguration(update.key, update.value);
                break;
            case 'device_command':
                this.emit('device_command', update);
                break;
            default:
                logger_1.logger.warn(`Unknown update type: ${update.type}`);
        }
    }
    getUploadEndpoint(type) {
        const endpoints = {
            sensor_data: '/sync/sensor-data',
            alerts: '/sync/alerts',
            farms: '/sync/farms',
            configurations: '/sync/configurations'
        };
        return endpoints[type] || '/sync/data';
    }
    async retryOperation(operation) {
        let lastError;
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error('Unknown error');
                if (attempt < this.config.retryAttempts) {
                    logger_1.logger.debug(`Attempt ${attempt} failed, retrying in ${this.config.retryDelay}ms`);
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }
        throw lastError;
    }
    async loadSyncStatus() {
        try {
            const saved = await this.database.getSyncStatus();
            if (saved) {
                this.status = { ...this.status, ...saved };
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to load sync status:', error);
        }
    }
    async saveSyncStatus() {
        try {
            await this.database.saveSyncStatus(this.status);
        }
        catch (error) {
            logger_1.logger.error('Failed to save sync status:', error);
        }
    }
    async forcefulSync() {
        logger_1.logger.info('Manual sync triggered');
        await this.performSync();
    }
    async testConnectivity() {
        await this.checkConnectivity();
        return this.status.isOnline;
    }
    getStatus() {
        return { ...this.status };
    }
    async sendAlert(alert) {
        if (!this.status.isOnline) {
            throw new Error('Cloud service offline');
        }
        try {
            await this.apiClient.post('/alerts', alert);
            logger_1.logger.info(`Alert sent to cloud: ${alert.type}`);
        }
        catch (error) {
            logger_1.logger.error('Failed to send alert:', error);
            throw error;
        }
    }
    async getConfiguration(key) {
        if (!this.status.isOnline) {
            return await this.database.getConfiguration(key);
        }
        try {
            const response = await this.apiClient.get(`/configurations/${key}`);
            return response.data.value;
        }
        catch (error) {
            logger_1.logger.warn(`Failed to get configuration from cloud, using local: ${key}`);
            return await this.database.getConfiguration(key);
        }
    }
    async updateConfiguration(key, value) {
        await this.database.setConfiguration(key, value);
        if (this.status.isOnline) {
            try {
                await this.apiClient.put(`/configurations/${key}`, { value });
                logger_1.logger.info(`Configuration updated in cloud: ${key}`);
            }
            catch (error) {
                logger_1.logger.warn(`Failed to update configuration in cloud: ${key}`);
            }
        }
    }
}
exports.CloudBridge = CloudBridge;
//# sourceMappingURL=cloudBridge.js.map