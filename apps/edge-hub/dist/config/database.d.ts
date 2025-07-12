import { Knex } from 'knex';
export interface DatabaseConfig {
    client: string;
    connection: {
        filename: string;
    };
    useNullAsDefault: boolean;
    pool?: {
        min: number;
        max: number;
        acquireTimeoutMillis: number;
        createTimeoutMillis: number;
        destroyTimeoutMillis: number;
        idleTimeoutMillis: number;
        reapIntervalMillis: number;
        createRetryIntervalMillis: number;
    };
    migrations?: {
        directory: string;
        tableName: string;
    };
    seeds?: {
        directory: string;
    };
}
export declare const getDatabaseConfig: () => Knex.Config;
export declare const createDatabaseTables: (knex: Knex) => Promise<void>;
//# sourceMappingURL=database.d.ts.map