import { EntityManager, IDatabaseDriver } from '@mikro-orm/core';

export interface IDatabaseManager {
    boot(): Promise<void>;
    get freshEntityManager(): EntityManager;
}

export const DATABASE_MANAGER_TOKEN = Symbol.for('IDatabaseManager');
