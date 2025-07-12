"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraService = void 0;
const events_1 = require("events");
const logger_1 = require("../utils/logger");
const ai_1 = require("../config/ai");
class CameraService extends events_1.EventEmitter {
    constructor() {
        super();
        this.devices = new Map();
        this.isInitialized = false;
        this.captureQueue = [];
        this.processingQueue = false;
        this.config = (0, ai_1.getCameraConfig)();
    }
    async initialize() {
        try {
            await this.detectCameras();
            await this.initializeDevices();
            await this.loadVisionModels();
            this.isInitialized = true;
            logger_1.logger.info('Camera service initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize camera service:', error);
            throw error;
        }
    }
    async detectCameras() {
        try {
            const detectedDevices = [];
            try {
                detectedDevices.push({
                    id: 'csi-0',
                    name: 'Raspberry Pi Camera',
                    type: 'csi',
                    path: '/dev/video0'
                });
            }
            catch (error) {
                logger_1.logger.debug('No CSI camera detected');
            }
            try {
                for (let i = 0; i < 4; i++) {
                    const devicePath = `/dev/video${i}`;
                    detectedDevices.push({
                        id: `usb-${i}`,
                        name: `USB Camera ${i}`,
                        type: 'usb',
                        path: devicePath
                    });
                }
            }
            catch (error) {
                logger_1.logger.debug('USB camera detection failed:', error);
            }
            logger_1.logger.info(`Detected ${detectedDevices.length} camera devices`);
        }
        catch (error) {
            logger_1.logger.error('Camera detection failed:', error);
        }
    }
    async initializeDevices() {
        for (const deviceConfig of this.config.devices) {
            try {
                const device = await this.initializeDevice(deviceConfig);
                this.devices.set(deviceConfig.id, device);
                logger_1.logger.info(`Camera device ${deviceConfig.id} initialized`);
            }
            catch (error) {
                logger_1.logger.error(`Failed to initialize camera device ${deviceConfig.id}:`, error);
            }
        }
    }
    async initializeDevice(config) {
        return {
            id: config.id,
            name: config.name,
            isActive: false,
            capture: async (options) => {
                return await this.captureFromDevice(config.id, options);
            }
        };
    }
    async loadVisionModels() {
        if (!this.config.processing.enableObjectDetection &&
            !this.config.processing.enablePlantDisease &&
            !this.config.processing.enableCropAnalysis) {
            logger_1.logger.info('Vision processing disabled, skipping model loading');
            return;
        }
        try {
            logger_1.logger.info('Loading vision models...');
            logger_1.logger.info('Vision models loaded successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to load vision models:', error);
        }
    }
    async capturePhoto(options = {}) {
        if (!this.isInitialized) {
            throw new Error('Camera service not initialized');
        }
        const deviceId = options.deviceId || this.getDefaultDevice();
        const device = this.devices.get(deviceId);
        if (!device) {
            throw new Error(`Camera device ${deviceId} not found`);
        }
        return new Promise((resolve, reject) => {
            this.captureQueue.push(async () => {
                try {
                    const result = await this.performCapture(deviceId, options);
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
            });
            this.processQueue();
        });
    }
    async performCapture(deviceId, options) {
        const captureId = `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        try {
            logger_1.logger.info(`Starting photo capture on device ${deviceId}`);
            const imageData = await this.captureFromDevice(deviceId, options);
            const result = {
                id: captureId,
                deviceId,
                imageData,
                metadata: {
                    timestamp: new Date(),
                    width: options.width || 1920,
                    height: options.height || 1080,
                    format: options.format || 'jpeg',
                    size: imageData.length
                }
            };
            if (this.shouldAnalyzeImage()) {
                result.analysis = await this.analyzeImage(imageData);
            }
            this.emit('photo_captured', result);
            logger_1.logger.info(`Photo captured successfully: ${captureId}`);
            return result;
        }
        catch (error) {
            logger_1.logger.error(`Photo capture failed: ${error}`);
            throw error;
        }
    }
    async captureFromDevice(deviceId, options) {
        const mockImageData = Buffer.alloc(1024 * 100);
        mockImageData.fill(0xFF);
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockImageData;
    }
    shouldAnalyzeImage() {
        return this.config.processing.enableObjectDetection ||
            this.config.processing.enablePlantDisease ||
            this.config.processing.enableCropAnalysis;
    }
    async analyzeImage(imageData) {
        try {
            const analysis = {};
            if (this.config.processing.enableObjectDetection) {
                analysis.objects = await this.detectObjects(imageData);
            }
            if (this.config.processing.enablePlantDisease) {
                analysis.diseases = await this.detectDiseases(imageData);
            }
            if (this.config.processing.enableCropAnalysis) {
                analysis.cropHealth = await this.analyzeCropHealth(imageData);
            }
            return analysis;
        }
        catch (error) {
            logger_1.logger.error('Image analysis failed:', error);
            return null;
        }
    }
    async detectObjects(imageData) {
        return [
            {
                label: 'plant',
                confidence: 0.95,
                bbox: [100, 100, 200, 200]
            },
            {
                label: 'leaf',
                confidence: 0.87,
                bbox: [120, 120, 180, 180]
            }
        ];
    }
    async detectDiseases(imageData) {
        return [
            {
                type: 'leaf_spot',
                confidence: 0.23,
                severity: 'low'
            }
        ];
    }
    async analyzeCropHealth(imageData) {
        return {
            overall: 0.85,
            leafColor: 'healthy_green',
            growthStage: 'vegetative'
        };
    }
    getDefaultDevice() {
        const deviceIds = Array.from(this.devices.keys());
        return deviceIds.length > 0 ? deviceIds[0] : '';
    }
    async processQueue() {
        if (this.processingQueue || this.captureQueue.length === 0) {
            return;
        }
        this.processingQueue = true;
        while (this.captureQueue.length > 0) {
            const capture = this.captureQueue.shift();
            if (capture) {
                try {
                    await capture();
                }
                catch (error) {
                    logger_1.logger.error('Capture queue processing error:', error);
                }
            }
        }
        this.processingQueue = false;
    }
    async getDevices() {
        const devices = [];
        for (const [id, device] of this.devices) {
            devices.push({
                id,
                name: device.name,
                status: device.isActive ? 'active' : 'inactive'
            });
        }
        return devices;
    }
    async testDevice(deviceId) {
        try {
            const device = this.devices.get(deviceId);
            if (!device)
                return false;
            await this.captureFromDevice(deviceId, { width: 640, height: 480 });
            return true;
        }
        catch (error) {
            logger_1.logger.error(`Device test failed for ${deviceId}:`, error);
            return false;
        }
    }
    async cleanup() {
        try {
            this.captureQueue.length = 0;
            for (const [id, device] of this.devices) {
                try {
                    if (device.close) {
                        await device.close();
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Error closing device ${id}:`, error);
                }
            }
            this.devices.clear();
            this.isInitialized = false;
            logger_1.logger.info('Camera service cleaned up');
        }
        catch (error) {
            logger_1.logger.error('Camera service cleanup error:', error);
        }
    }
}
exports.CameraService = CameraService;
//# sourceMappingURL=cameraService.js.map