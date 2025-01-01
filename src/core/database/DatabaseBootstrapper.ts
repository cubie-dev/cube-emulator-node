import { Bootstrapper } from '../bootstrap/Bootstrapper';
import {DATABASE_MANAGER_TOKEN, IDatabaseManager} from '../../api/core/database/DatabaseManager';
import {DatabaseManager} from './DatabaseManager';
import {User} from './entities/User';
import {IEntityManager} from '../../api/core/database/IEntityManager';

export class DatabaseBootstrapper extends Bootstrapper {
    public async registerBindings(): Promise<void> {
        this.emulator.rootContainer
            .bind<IDatabaseManager>(DATABASE_MANAGER_TOKEN)
            .to(DatabaseManager)
            .inSingletonScope();
    }

    public async boot(): Promise<void> {
       const dbManager = await this.emulator.rootContainer
            .get<IDatabaseManager>(DATABASE_MANAGER_TOKEN);

       await dbManager.boot();
    }
}
