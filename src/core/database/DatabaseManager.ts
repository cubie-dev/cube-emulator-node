import { IDatabaseManager } from '../../api/core/database/DatabaseManager';
import { EntityManager, MikroORM } from '@mikro-orm/postgresql';
import { inject } from 'inversify';
import { EMULATOR_TOKEN, IEmulator } from '../../api/core/Emulator';
import { CONFIG_REPOSITORY_TOKEN, IRepository } from '../../api/core/config/Repository';

export class DatabaseManager implements IDatabaseManager {
    private orm: MikroORM;
    private _em: EntityManager;

    public constructor(
        @inject(EMULATOR_TOKEN) private emulator: IEmulator,
        @inject(CONFIG_REPOSITORY_TOKEN) private config: IRepository,
    ) {
    }

    public async boot(): Promise<void> {
        this.orm = await MikroORM.init({
            entities: ['core/database/entities/**/*.ts'],
            baseDir: this.emulator.rootDirectory,
            dbName: this.config.get<string>('database.name'),
            host: this.config.get<string>('database.host'),
            port: this.config.get<number>('database.port'),
            user: this.config.get<string>('database.username'),
            password: this.config.get<string>('database.password'),
            debug: this.config.get<boolean>('debug') === true,
        });
        this._em = this.orm.em.fork();
    }

    public get em(): EntityManager {
        return this._em;
    }
}
