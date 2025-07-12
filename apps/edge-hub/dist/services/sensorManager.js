"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SensorManager = void 0;
const serialport_1 = require("serialport");
const logger_1 = require("../utils/logger");
class SensorManager {
    constructor(database) {
        this.serialPorts = new Map();
        this.isRunning = false;
        this.eventEmitter = new (require('events').EventEmitter)();
        this.database = database;
    }
    async start() {
        try {
            this.isRunning = true;
            await this.initializeSerialPorts();
            this.startDataCollection();
            logger_1.logger.info('SensorManager started successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to start SensorManager:', error);
            throw error;
        }
    }
    async stop() {
        this.isRunning = false;
        for (const [portPath, port] of this.serialPorts) {
            try {
                await port.close();
                logger_1.logger.info(`Closed serial port: ${portPath}`);
            }
            catch (error) {
                logger_1.logger.error(`Error closing serial port ${portPath}:`, error);
            }
        }
        this.serialPorts.clear();
        logger_1.logger.info('SensorManager stopped');
    }
    async initializeSerialPorts() {
        try {
            const ports = await serialport_1.SerialPort.list();
            logger_1.logger.info(`Found ${ports.length} serial ports`);
            for (const portInfo of ports) {
                if (this.isSensorPort(portInfo)) {
                    await this.connectToSensor(portInfo.path);
                }
            }
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize serial ports:', error);
        }
    }
    isSensorPort(portInfo) {
        const sensorIdentifiers = ['Arduino', 'ESP32', 'USB Serial', 'CH340'];
        return sensorIdentifiers.some(id => portInfo.manufacturer?.includes(id) ||
            portInfo.productId?.includes(id));
    }
    async connectToSensor(portPath) {
        try {
            const port = new serialport_1.SerialPort({
                path: portPath,
                baudRate: 9600,
                autoOpen: false
            });
            await new Promise((resolve, reject) => {
                port.open((err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
            port.on('data', (data) => {
                this.processSensorData(portPath, data);
            });
            port.on('error', (error) => {
                logger_1.logger.error(`Serial port error on ${portPath}:`, error);
            });
            this.serialPorts.set(portPath, port);
            logger_1.logger.info(`Connected to sensor on port: ${portPath}`);
        }
        catch (error) {
            logger_1.logger.error(`Failed to connect to sensor on ${portPath}:`, error);
        }
    }
    processSensorData(portPath, data) {
        try {
            const dataStr = data.toString().trim();
            const sensorData = this.parseSensorData(portPath, dataStr);
            if (sensorData) {
                this.storeSensorData(sensorData);
            }
        }
        catch (error) {
            logger_1.logger.error(`Error processing sensor data from ${portPath}:`, error);
        }
    }
    parseSensorData(portPath, dataStr) {
        try {
            const parts = dataStr.split(',');
            if (parts.length < 4) {
                return null;
            }
            return {
                sensorId: parts[0],
                type: parts[1],
                value: parseFloat(parts[2]),
                unit: parts[3],
                timestamp: new Date()
            };
        }
        catch (error) {
            logger_1.logger.error(`Error parsing sensor data: ${dataStr}`, error);
            return null;
        }
    }
    async storeSensorData(data) {
        try {
            await this.database.insertSensorData(data);
            logger_1.logger.debug(`Stored sensor data: ${data.sensorId} = ${data.value}${data.unit}`);
            this.eventEmitter.emit('sensorData', data);
        }
        catch (error) {
            logger_1.logger.error('Error storing sensor data:', error);
        }
    }
    startDataCollection() {
        setInterval(() => {
            if (this.isRunning) {
                const mockData = {
                    sensorId: 'DEMO_SENSOR_01',
                    type: 'soil_moisture',
                    value: Math.random() * 100,
                    unit: 'percent',
                    timestamp: new Date()
                };
                this.storeSensorData(mockData);
            }
        }, 30000);
    }
    async getSensorData(sensorId, limit = 100) {
        return this.database.getSensorData(sensorId, limit);
    }
    async getLatestSensorData(sensorId) {
        const data = await this.database.getSensorData(sensorId, 1);
        return data[0] || null;
    }
    initialize() {
        return this.start();
    }
    on(event, callback) {
        this.eventEmitter.on(event, callback);
    }
    cleanup() {
        return this.stop();
    }
    get isActive() {
        return this.isRunning;
    }
}
exports.SensorManager = SensorManager;
//# sourceMappingURL=sensorManager.js.map