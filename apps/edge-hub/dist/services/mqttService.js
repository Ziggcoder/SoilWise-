"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MQTTService = void 0;
const mqtt_1 = __importDefault(require("mqtt"));
const logger_1 = require("../utils/logger");
class MQTTService {
    constructor(database) {
        this.client = null;
        this.isConnected = false;
        this.reconnectInterval = null;
        this.database = database;
    }
    async connect() {
        try {
            const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
            const options = {
                clientId: `edge-hub-${Math.random().toString(16).substr(2, 8)}`,
                clean: true,
                connectTimeout: 4000,
                username: process.env.MQTT_USERNAME,
                password: process.env.MQTT_PASSWORD,
                reconnectPeriod: 1000,
            };
            this.client = mqtt_1.default.connect(brokerUrl, options);
            this.client.on('connect', () => {
                this.isConnected = true;
                logger_1.logger.info('Connected to MQTT broker');
                this.subscribeToTopics();
            });
            this.client.on('message', (topic, message) => {
                this.handleMessage(topic, message);
            });
            this.client.on('error', (error) => {
                logger_1.logger.error('MQTT connection error:', error);
                this.isConnected = false;
            });
            this.client.on('close', () => {
                this.isConnected = false;
                logger_1.logger.warn('MQTT connection closed');
            });
            this.client.on('offline', () => {
                this.isConnected = false;
                logger_1.logger.warn('MQTT client offline');
            });
        }
        catch (error) {
            logger_1.logger.error('Failed to connect to MQTT broker:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
        }
        if (this.client) {
            await new Promise((resolve) => {
                this.client.end(false, {}, () => {
                    this.isConnected = false;
                    logger_1.logger.info('Disconnected from MQTT broker');
                    resolve();
                });
            });
        }
    }
    subscribeToTopics() {
        if (!this.client)
            return;
        const topics = [
            'sensors/+/data',
            'sensors/+/config',
            'commands/+',
            'alerts/+',
            'sync/+',
        ];
        topics.forEach(topic => {
            this.client.subscribe(topic, (err) => {
                if (err) {
                    logger_1.logger.error(`Failed to subscribe to topic ${topic}:`, err);
                }
                else {
                    logger_1.logger.info(`Subscribed to topic: ${topic}`);
                }
            });
        });
    }
    async handleMessage(topic, message) {
        try {
            const messageStr = message.toString();
            logger_1.logger.debug(`Received message on ${topic}: ${messageStr}`);
            if (topic.startsWith('sensors/') && topic.endsWith('/data')) {
                await this.handleSensorData(topic, messageStr);
            }
            else if (topic.startsWith('commands/')) {
                await this.handleCommand(topic, messageStr);
            }
            else if (topic.startsWith('alerts/')) {
                await this.handleAlert(topic, messageStr);
            }
            else if (topic.startsWith('sync/')) {
                await this.handleSync(topic, messageStr);
            }
        }
        catch (error) {
            logger_1.logger.error(`Error handling message on ${topic}:`, error);
        }
    }
    async handleSensorData(topic, messageStr) {
        try {
            const sensorData = JSON.parse(messageStr);
            await this.database.insertSensorData(sensorData);
            logger_1.logger.debug(`Stored sensor data from MQTT: ${sensorData.sensorId}`);
        }
        catch (error) {
            logger_1.logger.error('Error handling sensor data:', error);
        }
    }
    async handleCommand(topic, messageStr) {
        try {
            const command = JSON.parse(messageStr);
            logger_1.logger.info(`Received command: ${command.type}`);
            switch (command.type) {
                case 'calibrate_sensor':
                    await this.calibrateSensor(command.sensorId, command.params);
                    break;
                case 'update_config':
                    await this.updateConfig(command.config);
                    break;
                case 'restart_service':
                    await this.restartService(command.service);
                    break;
                default:
                    logger_1.logger.warn(`Unknown command type: ${command.type}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Error handling command:', error);
        }
    }
    async handleAlert(topic, messageStr) {
        try {
            const alert = JSON.parse(messageStr);
            await this.database.insertAlert(alert);
            logger_1.logger.info(`Stored alert: ${alert.type} - ${alert.message}`);
        }
        catch (error) {
            logger_1.logger.error('Error handling alert:', error);
        }
    }
    async handleSync(topic, messageStr) {
        try {
            const syncData = JSON.parse(messageStr);
            logger_1.logger.info(`Received sync request: ${syncData.type}`);
            switch (syncData.type) {
                case 'full_sync':
                    await this.performFullSync();
                    break;
                case 'incremental_sync':
                    await this.performIncrementalSync(syncData.timestamp);
                    break;
                default:
                    logger_1.logger.warn(`Unknown sync type: ${syncData.type}`);
            }
        }
        catch (error) {
            logger_1.logger.error('Error handling sync:', error);
        }
    }
    async publishSensorData(sensorData) {
        if (!this.client || !this.isConnected) {
            logger_1.logger.warn('Cannot publish sensor data: MQTT not connected');
            return;
        }
        try {
            const topic = `sensors/${sensorData.sensorId}/data`;
            const message = JSON.stringify(sensorData);
            await new Promise((resolve, reject) => {
                this.client.publish(topic, message, (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
            logger_1.logger.debug(`Published sensor data: ${sensorData.sensorId}`);
        }
        catch (error) {
            logger_1.logger.error('Error publishing sensor data:', error);
        }
    }
    async publishAlert(alert) {
        if (!this.client || !this.isConnected) {
            logger_1.logger.warn('Cannot publish alert: MQTT not connected');
            return;
        }
        try {
            const topic = `alerts/${alert.type}`;
            const message = JSON.stringify(alert);
            await new Promise((resolve, reject) => {
                this.client.publish(topic, message, (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
            logger_1.logger.info(`Published alert: ${alert.type}`);
        }
        catch (error) {
            logger_1.logger.error('Error publishing alert:', error);
        }
    }
    publish(topic, message) {
        if (!this.client || !this.isConnected) {
            logger_1.logger.warn('Cannot publish: MQTT client not connected');
            return;
        }
        this.client.publish(topic, message, (err) => {
            if (err) {
                logger_1.logger.error(`Failed to publish to topic ${topic}:`, err);
            }
            else {
                logger_1.logger.debug(`Published to topic ${topic}`);
            }
        });
    }
    on(event, callback) {
        if (!this.client) {
            logger_1.logger.warn('Cannot add listener: MQTT client not initialized');
            return;
        }
        if (event === 'message') {
            this.client.on('message', callback);
        }
        else if (event === 'connect') {
            this.client.on('connect', callback);
        }
        else if (event === 'error') {
            this.client.on('error', callback);
        }
        else {
            logger_1.logger.warn(`Unsupported event type: ${event}`);
        }
    }
    async calibrateSensor(sensorId, params) {
        logger_1.logger.info(`Calibrating sensor ${sensorId} with params:`, params);
    }
    async updateConfig(config) {
        logger_1.logger.info('Updating configuration:', config);
    }
    async restartService(serviceName) {
        logger_1.logger.info(`Restarting service: ${serviceName}`);
    }
    async performFullSync() {
        logger_1.logger.info('Performing full sync');
    }
    async performIncrementalSync(timestamp) {
        logger_1.logger.info(`Performing incremental sync from ${timestamp}`);
    }
    get connected() {
        return this.isConnected;
    }
}
exports.MQTTService = MQTTService;
//# sourceMappingURL=mqttService.js.map