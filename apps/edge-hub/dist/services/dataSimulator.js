"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSimulator = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
class DataSimulator extends events_1.EventEmitter {
    constructor() {
        super();
        this.devices = new Map();
        this.intervals = new Map();
        this.isRunning = false;
        this.initializeDevices();
    }
    initializeDevices() {
        this.devices.set('device_001', {
            id: 'device_001',
            name: 'Corn Field North Sensor',
            type: 'soil_station',
            location: { lat: 40.7128, lng: -74.0060 },
            sensors: ['soil_moisture', 'temperature', 'ph', 'nitrogen'],
            isActive: true,
            batteryLevel: 85,
            signalStrength: 92
        });
        this.devices.set('device_002', {
            id: 'device_002',
            name: 'Central Weather Station',
            type: 'weather_station',
            location: { lat: 40.7130, lng: -74.0058 },
            sensors: ['temperature', 'humidity'],
            isActive: true,
            batteryLevel: 78,
            signalStrength: 88
        });
        this.devices.set('device_003', {
            id: 'device_003',
            name: 'Greenhouse Soil Monitor',
            type: 'soil_station',
            location: { lat: 40.7125, lng: -74.0065 },
            sensors: ['soil_moisture', 'temperature', 'ph', 'phosphorus', 'potassium'],
            isActive: true,
            batteryLevel: 92,
            signalStrength: 95
        });
        this.devices.set('device_004', {
            id: 'device_004',
            name: 'Wheat Field East Sensor',
            type: 'soil_station',
            location: { lat: 40.7135, lng: -74.0055 },
            sensors: ['soil_moisture', 'temperature', 'ph'],
            isActive: true,
            batteryLevel: 65,
            signalStrength: 75
        });
        logger_1.logger.info(`Initialized ${this.devices.size} simulated devices`);
    }
    start() {
        if (this.isRunning) {
            logger_1.logger.warn('Data simulator already running');
            return;
        }
        this.isRunning = true;
        this.devices.forEach((device, deviceId) => {
            if (device.isActive) {
                const interval = setInterval(() => {
                    this.generateDeviceData(device);
                }, 30000);
                this.intervals.set(deviceId, interval);
            }
        });
        this.devices.forEach(device => {
            if (device.isActive) {
                this.generateDeviceData(device);
            }
        });
        this.startAlertSimulation();
        logger_1.logger.info('Data simulator started');
    }
    stop() {
        this.isRunning = false;
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals.clear();
        logger_1.logger.info('Data simulator stopped');
    }
    generateDeviceData(device) {
        const farmId = this.getFarmIdFromDevice(device.id);
        device.sensors.forEach(sensorType => {
            const reading = this.generateSensorReading(device, sensorType, farmId);
            this.emit('sensor_data', reading);
        });
        if (Math.random() < 0.1) {
            this.updateDeviceStatus(device);
            this.emit('device_status', {
                device_id: device.id,
                battery_level: device.batteryLevel,
                signal_strength: device.signalStrength,
                is_active: device.isActive,
                timestamp: new Date()
            });
        }
    }
    generateSensorReading(device, sensorType, farmId) {
        const baseValues = this.getBaseValues(sensorType, farmId);
        const variation = this.getRealisticVariation(sensorType);
        const value = baseValues.value + (Math.random() - 0.5) * variation;
        const now = new Date();
        const hour = now.getHours();
        const seasonalMultiplier = this.getSeasonalMultiplier(sensorType, now);
        const dailyMultiplier = this.getDailyMultiplier(sensorType, hour);
        const finalValue = Math.max(0, value * seasonalMultiplier * dailyMultiplier);
        return {
            sensor_id: `${device.id}_${sensorType}`,
            farm_id: farmId,
            type: sensorType,
            value: Math.round(finalValue * 100) / 100,
            unit: baseValues.unit,
            timestamp: new Date(),
            location: {
                lat: device.location.lat + (Math.random() - 0.5) * 0.0001,
                lng: device.location.lng + (Math.random() - 0.5) * 0.0001
            },
            quality: this.getDataQuality(device.signalStrength),
            battery_level: device.batteryLevel
        };
    }
    getBaseValues(sensorType, farmId) {
        const baseValues = {
            soil_moisture: { value: 45, unit: '%' },
            temperature: { value: 22, unit: '°C' },
            humidity: { value: 60, unit: '%' },
            ph: { value: 6.5, unit: 'pH' },
            nitrogen: { value: 25, unit: 'ppm' },
            phosphorus: { value: 15, unit: 'ppm' },
            potassium: { value: 180, unit: 'ppm' }
        };
        const farmAdjustments = {
            'farm_001': {
                soil_moisture: 1.1,
                nitrogen: 1.2,
                ph: 0.95
            },
            'farm_002': {
                soil_moisture: 1.3,
                temperature: 1.15,
                humidity: 1.2,
                phosphorus: 1.4
            },
            'farm_003': {
                soil_moisture: 0.9,
                nitrogen: 0.8,
                potassium: 1.1
            }
        };
        const base = baseValues[sensorType] || { value: 50, unit: 'units' };
        const adjustment = farmAdjustments[farmId]?.[sensorType] || 1;
        return {
            value: base.value * adjustment,
            unit: base.unit
        };
    }
    getRealisticVariation(sensorType) {
        const variations = {
            soil_moisture: 8,
            temperature: 6,
            humidity: 15,
            ph: 0.8,
            nitrogen: 8,
            phosphorus: 6,
            potassium: 30
        };
        return variations[sensorType] || 10;
    }
    getSeasonalMultiplier(sensorType, date) {
        const month = date.getMonth() + 1;
        const isSummer = month >= 6 && month <= 8;
        const isWinter = month >= 12 || month <= 2;
        const seasonalEffects = {
            temperature: { summer: 1.4, winter: 0.6 },
            humidity: { summer: 1.2, winter: 0.8 },
            soil_moisture: { summer: 0.8, winter: 1.1 },
            ph: { summer: 1.02, winter: 0.98 },
            nitrogen: { summer: 1.1, winter: 0.9 },
            phosphorus: { summer: 1.05, winter: 0.95 },
            potassium: { summer: 1.0, winter: 1.0 }
        };
        const effect = seasonalEffects[sensorType] || { summer: 1.0, winter: 1.0 };
        if (isSummer)
            return effect.summer;
        if (isWinter)
            return effect.winter;
        return 1.0;
    }
    getDailyMultiplier(sensorType, hour) {
        const dailyEffects = {
            temperature: (h) => 0.8 + 0.4 * Math.sin((h - 6) * Math.PI / 12),
            humidity: (h) => 1.2 - 0.4 * Math.sin((h - 6) * Math.PI / 12),
            soil_moisture: () => 1.0,
            ph: (h) => 1.0 + 0.05 * Math.sin(h * Math.PI / 12),
            nitrogen: () => 1.0,
            phosphorus: () => 1.0,
            potassium: () => 1.0
        };
        const effect = dailyEffects[sensorType];
        return effect ? effect(hour) : 1.0;
    }
    getDataQuality(signalStrength) {
        if (signalStrength > 85)
            return 'high';
        if (signalStrength > 60)
            return 'medium';
        return 'low';
    }
    updateDeviceStatus(device) {
        device.batteryLevel = Math.max(10, device.batteryLevel - Math.random() * 2);
        device.signalStrength += (Math.random() - 0.5) * 10;
        device.signalStrength = Math.max(30, Math.min(100, device.signalStrength));
        if (Math.random() < 0.01) {
            device.isActive = false;
            setTimeout(() => {
                device.isActive = true;
                logger_1.logger.info(`Device ${device.id} came back online`);
            }, 60000);
        }
    }
    getFarmIdFromDevice(deviceId) {
        const farmMapping = {
            'device_001': 'farm_001',
            'device_002': 'farm_001',
            'device_003': 'farm_002',
            'device_004': 'farm_003'
        };
        return farmMapping[deviceId] || 'farm_unknown';
    }
    startAlertSimulation() {
        const alertInterval = setInterval(() => {
            if (Math.random() < 0.1) {
                this.generateAlert();
            }
        }, 60000);
        this.intervals.set('alerts', alertInterval);
    }
    generateAlert() {
        const alertTypes = [
            { type: 'low_soil_moisture', severity: 'medium', message: 'Soil moisture below optimal range' },
            { type: 'high_temperature', severity: 'warning', message: 'Temperature exceeding recommended levels' },
            { type: 'ph_imbalance', severity: 'high', message: 'Soil pH outside optimal range' },
            { type: 'low_battery', severity: 'low', message: 'Device battery level low' },
            { type: 'connectivity_issue', severity: 'medium', message: 'Intermittent connectivity detected' },
            { type: 'nutrient_deficiency', severity: 'high', message: 'Nitrogen levels below recommended threshold' }
        ];
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const devices = Array.from(this.devices.keys());
        const randomDevice = devices[Math.floor(Math.random() * devices.length)];
        const deviceId = randomDevice || 'device_001';
        const farmId = this.getFarmIdFromDevice(deviceId);
        if (alert) {
            this.emit('alert', {
                id: `alert_${Date.now()}`,
                type: alert.type,
                severity: alert.severity,
                message: alert.message,
                farm_id: farmId,
                sensor_id: deviceId,
                timestamp: new Date(),
                resolved: false,
                metadata: {
                    automated: true,
                    confidence: Math.random() * 0.3 + 0.7
                }
            });
        }
    }
    triggerAlert(type, farmId) {
        this.emit('alert', {
            id: `manual_alert_${Date.now()}`,
            type,
            severity: 'high',
            message: `Manual test alert: ${type}`,
            farm_id: farmId,
            timestamp: new Date(),
            resolved: false,
            metadata: {
                automated: false,
                manual_trigger: true
            }
        });
    }
    getDeviceStatus() {
        return Array.from(this.devices.values());
    }
    isActive() {
        return this.isRunning;
    }
}
exports.DataSimulator = DataSimulator;
//# sourceMappingURL=dataSimulator.js.map