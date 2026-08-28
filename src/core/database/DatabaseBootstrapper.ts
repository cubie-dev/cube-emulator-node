import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { DATABASE_MANAGER_TOKEN, type IDatabaseManager } from '../../api/core/database/DatabaseManager';
import { DatabaseManager } from './DatabaseManager';

export class DatabaseBootstrapper extends Bootstrapper {
    public override async registerBindings(): Promise<void> {
        this.emulator.rootContainer
            .bind<IDatabaseManager>(DATABASE_MANAGER_TOKEN)
            .to(DatabaseManager)
            .inSingletonScope();
    }

    public override async boot(): Promise<void> {
       const dbManager = this.emulator.rootContainer
            .get<IDatabaseManager>(DATABASE_MANAGER_TOKEN);

       await dbManager.boot();
    }
}
