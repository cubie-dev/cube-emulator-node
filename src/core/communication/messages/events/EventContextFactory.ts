import { EventContext } from './EventContext';
import { inject, injectable } from 'inversify';
import { DATABASE_MANAGER_TOKEN, IDatabaseManager } from '../../../../api/core/database/DatabaseManager';
import { Client } from '../../Client';

@injectable()
export class EventContextFactory {
    public constructor(
        @inject(DATABASE_MANAGER_TOKEN) private databaseManager: IDatabaseManager,
    ) {
    }

    public makeForClient(client: Client): EventContext {
        return new EventContext(
            client,
            this.databaseManager.freshEntityManager,
        );
    }
}
