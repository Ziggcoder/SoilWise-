"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const logger_1 = require("./utils/logger");
const sensorManager_1 = require("./services/sensorManager");
const mqttService_1 = require("./services/mqttService");
const aiService_1 = require("./services/aiService");
const voiceService_1 = require("./services/voiceService");
const syncService_1 = require("./services/syncService");
const cameraService_1 = require("./services/cameraService");
const pwaSyncBridge_1 = require("./services/pwaSyncBridge");
const dashboardBridge_1 = require("./services/dashboardBridge");
const cloudBridge_1 = require("./services/cloudBridge");
const systemMonitor_1 = require("./services/systemMonitor");
const dataSimulator_1 = require("./services/dataSimulator");
const localDatabase_1 = require("./database/localDatabase");
const routes_1 = require("./routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
const database = new localDatabase_1.LocalDatabase();
const sensorManager = new sensorManager_1.SensorManager(database);
const mqttService = new mqttService_1.MQTTService(database);
const aiService = new aiService_1.AIService();
const voiceService = new voiceService_1.VoiceService(aiService);
const syncService = new syncService_1.SyncService(database);
const cameraService = new cameraService_1.CameraService();
const pwaSyncBridge = new pwaSyncBridge_1.PWASyncBridge(database, mqttService);
const dashboardBridge = new dashboardBridge_1.DashboardBridge(io, database, mqttService, sensorManager);
const cloudBridge = new cloudBridge_1.CloudBridge(database);
const systemMonitor = new systemMonitor_1.SystemMonitor(database);
const dataSimulator = new dataSimulator_1.DataSimulator();
(0, routes_1.setupRoutes)(app, {
    database,
    sensorManager,
    aiService,
    voiceService,
    syncService
});
app.get('/health', (req, res) => {
    const status = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        services: {
            database: database ? 'connected' : 'disconnected',
            mqtt: 'connected',
            websocket: io ? 'active' : 'inactive',
            simulator: dataSimulator ? 'running' : 'stopped'
        },
        system: {
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version
        }
    };
    res.json(status);
});
app.get('/status', async (req, res) => {
    try {
        const systemInfo = await systemMonitor.getSystemInfo();
        const status = {
            ...systemInfo,
            services: {
                database: database ? 'connected' : 'disconnected',
                mqtt: 'connected',
                websocket: io ? 'active' : 'inactive',
                simulator: dataSimulator ? 'running' : 'stopped',
                pwaBridge: 'active',
                dashboardBridge: 'active',
                cloudBridge: 'active'
            },
            metrics: {
                totalSensorReadings: 0,
                activeFarms: 3,
                connectedDevices: 4,
                alertsCount: 0
            }
        };
        res.json(status);
    }
    catch (error) {
        logger_1.logger.error('Status check failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get system status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
io.on('connection', (socket) => {
    logger_1.logger.info(`Client connected: ${socket.id}`);
    socket.on('subscribe_sensor', (sensorId) => {
        socket.join(`sensor_${sensorId}`);
        logger_1.logger.info(`Client ${socket.id} subscribed to sensor ${sensorId}`);
    });
    socket.on('voice_input', async (audioData) => {
        try {
            const response = await voiceService.processVoiceInput(audioData);
            socket.emit('voice_response', response);
        }
        catch (error) {
            logger_1.logger.error('Voice processing error:', error);
            socket.emit('voice_error', { error: 'Failed to process voice input' });
        }
    });
    socket.on('disconnect', () => {
        logger_1.logger.info(`Client disconnected: ${socket.id}`);
    });
});
async function startServices() {
    try {
        logger_1.logger.info('Starting SoilWise Edge Hub services...');
        await database.initialize();
        logger_1.logger.info('Database initialized');
        await sensorManager.start();
        logger_1.logger.info('Sensor Manager started');
        await mqttService.connect();
        logger_1.logger.info('MQTT Service connected');
        await aiService.initialize();
        logger_1.logger.info('AI Service initialized');
        await voiceService.initialize();
        logger_1.logger.info('Voice Service initialized');
        await syncService.start();
        logger_1.logger.info('Sync Service started');
        logger_1.logger.info('Camera Service ready');
        await pwaSyncBridge.start();
        logger_1.logger.info('PWA Sync Bridge started');
        await dashboardBridge.start();
        logger_1.logger.info('Dashboard Bridge started');
        await cloudBridge.start();
        logger_1.logger.info('Cloud Bridge started');
        await systemMonitor.start();
        logger_1.logger.info('System Monitor started');
        if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SIMULATOR === 'true') {
            dataSimulator.start();
            logger_1.logger.info('Data Simulator started');
        }
        setupServiceEventHandlers();
        logger_1.logger.info('All services started successfully');
    }
    catch (error) {
        logger_1.logger.error('Failed to start services:', error);
        process.exit(1);
    }
}
function setupServiceEventHandlers() {
    sensorManager.on('data', (data) => {
        io.emit('sensor_data', data);
    });
    systemMonitor.on('alert', (alert) => {
        io.emit('system_alert', alert);
    });
    cameraService.on('photo_captured', (photo) => {
        io.emit('camera_update', photo);
    });
    dataSimulator.on('sensor_data', async (data) => {
        await database.insertSensorData(data);
        io.emit('sensor_data', data);
        mqttService.publish(`sensors/${data.farm_id}/${data.sensor_id}/data`, data);
    });
    dataSimulator.on('alert', async (alert) => {
        await database.insertAlert(alert);
        io.emit('system_alert', alert);
        mqttService.publish(`alerts/${alert.farm_id}`, alert);
    });
    dataSimulator.on('device_status', (status) => {
        io.emit('device_status', status);
        mqttService.publish(`devices/${status.device_id}/status`, status);
    });
    logger_1.logger.info('Service event handlers configured');
}
async function stopServices() {
    logger_1.logger.info('Stopping services...');
    try {
        dataSimulator.stop();
        await systemMonitor.stop();
        await cloudBridge.stop();
        await dashboardBridge.stop();
        await pwaSyncBridge.stop();
        await syncService.stop();
        await voiceService.cleanup();
        await aiService.cleanup();
        await mqttService.disconnect();
        await sensorManager.stop();
        await database.close();
        logger_1.logger.info('All services stopped');
    }
    catch (error) {
        logger_1.logger.error('Error stopping services:', error);
    }
}
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await stopServices();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    await stopServices();
    process.exit(0);
});
async function startServer() {
    try {
        await startServices();
        server.listen(PORT, () => {
            logger_1.logger.info(`SoilWise Edge Hub server running on port ${PORT}`);
            logger_1.logger.info('🌱 Edge Hub is ready to serve!');
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer().catch((error) => {
    logger_1.logger.error('Startup error:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map