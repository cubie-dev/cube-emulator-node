export interface IRepository {
    loadConfig(): Promise<void>;
    get<T>(key: string, defaultValue: T|null): T;
}

export const CONFIG_REPOSITORY_TOKEN = Symbol.for('IRepository');
