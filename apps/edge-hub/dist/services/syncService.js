"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
class SyncService {
    constructor(database, config) {
        this.syncInterval = null;
        this.isRunning = false;
        this.isOnline = false;
        this.database = database;
        this.config = {
            cloudEndpoint: process.env.CLOUD_SYNC_ENDPOINT || 'https://api.soilwise.com',
            apiKey: process.env.CLOUD_API_KEY || undefined,
            syncInterval: 300000,
            batchSize: 100,
            retryAttempts: 3,
            retryDelay: 5000,
            ...config
        };
        this.status = {
            lastSync: null,
            isSync: false,
            pendingItems: 0,
            failedItems: 0,
            totalSynced: 0
        };
    }
    async start() {
        try {
            this.isRunning = true;
            await this.loadSyncStatus();
            await this.performInitialSync();
            this.startPeriodicSync();
            logger_1.logger.info('Sync Service started successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to start Sync Service:', error);
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
        logger_1.logger.info('Sync Service stopped');
    }
    async performSync() {
        if (this.status.isSync) {
            logger_1.logger.warn('Sync already in progress, skipping');
            return;
        }
        try {
            this.status.isSync = true;
            logger_1.logger.info('Starting sync operation');
            await this.syncSensorData();
            await this.syncAlerts();
            await this.syncFarmData();
            await this.syncConfigurations();
            this.status.lastSync = new Date();
            logger_1.logger.info('Sync operation completed successfully');
        }
        catch (error) {
            logger_1.logger.error('Sync operation failed:', error);
            throw error;
        }
        finally {
            this.status.isSync = false;
            await this.saveSyncStatus();
        }
    }
    async performInitialSync() {
        logger_1.logger.info('Performing initial sync');
        try {
            await this.downloadConfigurations();
            await this.performSync();
            logger_1.logger.info('Initial sync completed');
        }
        catch (error) {
            logger_1.logger.error('Initial sync failed:', error);
        }
    }
    startPeriodicSync() {
        this.syncInterval = setInterval(async () => {
            if (this.isRunning) {
                try {
                    await this.performSync();
                }
                catch (error) {
                    logger_1.logger.error('Periodic sync failed:', error);
                }
            }
        }, this.config.syncInterval);
        logger_1.logger.info(`Periodic sync started with interval: ${this.config.syncInterval}ms`);
    }
    async syncSensorData() {
        try {
            const unsyncedData = await this.database.getUnsyncedSensorData(this.config.batchSize);
            if (unsyncedData.length === 0) {
                logger_1.logger.debug('No unsynced sensor data found');
                return;
            }
            logger_1.logger.info(`Syncing ${unsyncedData.length} sensor data records`);
            const batches = this.createBatches(unsyncedData, this.config.batchSize);
            for (const batch of batches) {
                await this.uploadSensorDataBatch(batch);
            }
            logger_1.logger.info(`Successfully synced ${unsyncedData.length} sensor data records`);
        }
        catch (error) {
            logger_1.logger.error('Failed to sync sensor data:', error);
            throw error;
        }
    }
    async syncAlerts() {
        try {
            const unsyncedAlerts = await this.database.getUnsyncedAlerts(this.config.batchSize);
            if (unsyncedAlerts.length === 0) {
                logger_1.logger.debug('No unsynced alerts found');
                return;
            }
            logger_1.logger.info(`Syncing ${unsyncedAlerts.length} alerts`);
            const batches = this.createBatches(unsyncedAlerts, this.config.batchSize);
            for (const batch of batches) {
                await this.uploadAlertsBatch(batch);
            }
            logger_1.logger.info(`Successfully synced ${unsyncedAlerts.length} alerts`);
        }
        catch (error) {
            logger_1.logger.error('Failed to sync alerts:', error);
            throw error;
        }
    }
    async syncFarmData() {
        try {
            const unsyncedFarms = await this.database.getUnsyncedFarms(this.config.batchSize);
            if (unsyncedFarms.length === 0) {
                logger_1.logger.debug('No unsynced farm data found');
                return;
            }
            logger_1.logger.info(`Syncing ${unsyncedFarms.length} farm records`);
            const batches = this.createBatches(unsyncedFarms, this.config.batchSize);
            for (const batch of batches) {
                await this.uploadFarmDataBatch(batch);
            }
            logger_1.logger.info(`Successfully synced ${unsyncedFarms.length} farm records`);
        }
        catch (error) {
            logger_1.logger.error('Failed to sync farm data:', error);
            throw error;
        }
    }
    async syncConfigurations() {
        try {
            logger_1.logger.info('Syncing configurations');
            await this.downloadConfigurations();
            logger_1.logger.info('Configurations synced successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to sync configurations:', error);
            throw error;
        }
    }
    async uploadSensorDataBatch(batch) {
        const response = await this.makeRequest('/sync/sensor-data', {
            method: 'POST',
            data: { records: batch }
        });
        if (response.success) {
            const ids = batch.map(record => record.id);
            await this.database.markSensorDataSynced(ids);
            this.status.totalSynced += batch.length;
        }
        else {
            throw new Error(`Failed to upload sensor data batch: ${response.error}`);
        }
    }
    async uploadAlertsBatch(batch) {
        const response = await this.makeRequest('/sync/alerts', {
            method: 'POST',
            data: { records: batch }
        });
        if (response.success) {
            const ids = batch.map(record => record.id);
            await this.database.markAlertsSynced(ids);
            this.status.totalSynced += batch.length;
        }
        else {
            throw new Error(`Failed to upload alerts batch: ${response.error}`);
        }
    }
    async uploadFarmDataBatch(batch) {
        const response = await this.makeRequest('/sync/farms', {
            method: 'POST',
            data: { records: batch }
        });
        if (response.success) {
            const ids = batch.map(record => record.id);
            await this.database.markFarmsSynced(ids);
            this.status.totalSynced += batch.length;
        }
        else {
            throw new Error(`Failed to upload farm data batch: ${response.error}`);
        }
    }
    async downloadConfigurations() {
        const response = await this.makeRequest('/sync/configurations', {
            method: 'GET'
        });
        if (response.success && response.data) {
            await this.database.updateConfigurations(response.data);
        }
        else {
            throw new Error(`Failed to download configurations: ${response.error}`);
        }
    }
    async makeRequest(endpoint, options) {
        const url = `${this.config.cloudEndpoint}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'SoilWise-EdgeHub/1.0'
        };
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        let attempt = 0;
        let lastError = null;
        while (attempt < this.config.retryAttempts) {
            try {
                const response = await (0, axios_1.default)({
                    method: options.method || 'GET',
                    url,
                    headers,
                    data: options.data,
                    timeout: 30000
                });
                return {
                    success: true,
                    data: response.data,
                    status: response.status
                };
            }
            catch (error) {
                lastError = error;
                attempt++;
                if (attempt < this.config.retryAttempts) {
                    logger_1.logger.warn(`Request failed, retrying in ${this.config.retryDelay}ms (attempt ${attempt}/${this.config.retryAttempts})`);
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                }
            }
        }
        return {
            success: false,
            error: lastError?.message || 'Unknown error'
        };
    }
    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }
    async loadSyncStatus() {
        try {
            const status = await this.database.getSyncStatus();
            if (status) {
                this.status = {
                    ...this.status,
                    ...status,
                    lastSync: status.lastSync ? new Date(status.lastSync) : null
                };
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
    async forceSyncNow() {
        logger_1.logger.info('Force sync requested');
        await this.performSync();
    }
    getSyncStatus() {
        return { ...this.status };
    }
    async updateSyncConfig(config) {
        this.config = { ...this.config, ...config };
        if (config.syncInterval && this.syncInterval) {
            clearInterval(this.syncInterval);
            this.startPeriodicSync();
        }
        logger_1.logger.info('Sync configuration updated');
    }
    get running() {
        return this.isRunning;
    }
}
exports.SyncService = SyncService;
//# sourceMappingURL=syncService.js.map