import { type IDatabaseManager } from '../../api/core/database/DatabaseManager';
import { EntityManager, MikroORM } from '@mikro-orm/postgresql';
import { inject } from 'inversify';
import { EMULATOR_TOKEN, type IEmulator } from '../../api/core/Emulator';
import { CONFIG_REPOSITORY_TOKEN, type IRepository } from '../../api/core/config/Repository';
import mikroOrmConfig from '../../mikro-orm.config';

export class DatabaseManager implements IDatabaseManager {
    private orm!: MikroORM;

    public constructor(
        @inject(EMULATOR_TOKEN) private emulator: IEmulator,
        @inject(CONFIG_REPOSITORY_TOKEN) private config: IRepository,
    ) {
    }

    public async boot(): Promise<void> {
        this.orm = new MikroORM(mikroOrmConfig);
    }

    public get newEntityManager(): EntityManager {
        return this.orm.em.fork();
    }
}
