import { Bootstrapper } from '../bootstrap/Bootstrapper.js';
import { DATABASE_MANAGER_TOKEN, IDatabaseManager } from '../../api/core/database/DatabaseManager.js';
import { DatabaseManager } from './DatabaseManager.js';

export class DatabaseBootstrapper extends Bootstrapper {
    public async registerBindings(): Promise<void> {
        this.emulator.rootContainer
            .bind<IDatabaseManager>(DATABASE_MANAGER_TOKEN)
            .to(DatabaseManager)
            .inSingletonScope();
    }

    public async boot(): Promise<void> {
       const dbManager = this.emulator.rootContainer
            .get<IDatabaseManager>(DATABASE_MANAGER_TOKEN);

       await dbManager.boot();
    }
}
