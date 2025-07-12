export interface MQTTConfig {
    broker: {
        url: string;
        port: number;
        protocol: 'mqtt' | 'mqtts' | 'ws' | 'wss';
    };
    client: {
        clientId: string;
        username?: string;
        password?: string;
        clean: boolean;
        connectTimeout: number;
        reconnectPeriod: number;
        keepalive: number;
    };
    topics: {
        sensors: string;
        alerts: string;
        commands: string;
        sync: string;
        voice: string;
        system: string;
    };
    qos: 0 | 1 | 2;
    retain: boolean;
}
export declare const getMQTTConfig: () => MQTTConfig;
export interface LoRaWANConfig {
    gateway: {
        id: string;
        key: string;
        frequency: number;
        spreadingFactor: number;
        bandwidth: number;
        codingRate: string;
    };
    network: {
        server: string;
        port: number;
        appEUI: string;
        appKey: string;
    };
    devices: Array<{
        devEUI: string;
        appEUI: string;
        appKey: string;
        deviceType: string;
    }>;
}
export declare const getLoRaWANConfig: () => LoRaWANConfig;
//# sourceMappingURL=mqtt.d.ts.map