import { EntityManager } from '@mikro-orm/postgresql';

export interface IDatabaseManager {
    boot(): Promise<void>;
    get newEntityManager(): EntityManager;
}

export const DATABASE_MANAGER_TOKEN = Symbol.for('IDatabaseManager');
