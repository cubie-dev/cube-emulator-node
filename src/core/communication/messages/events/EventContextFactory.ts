import { EventContext } from './EventContext.ts';
import { Event } from './Event.ts';
import { inject } from 'inversify';
import { DATABASE_MANAGER_TOKEN, type IDatabaseManager } from '../../../../api/core/database/DatabaseManager.ts';
import type { IEventContextFactory } from '../../../../api/core/communication/EventContextFactory.ts';
import type { Client } from '../../Client.ts';
import { EMULATOR_TOKEN, type IEmulator } from '../../../../api/core/Emulator.ts';

export class EventContextFactory implements IEventContextFactory {
    public constructor(
        @inject(DATABASE_MANAGER_TOKEN) private readonly databaseManager: IDatabaseManager,
        @inject(EMULATOR_TOKEN) private readonly emulator: IEmulator,
    ) {
    }

    public create(client: Client, event: Event): EventContext {
        const childContainer = this.emulator.newChildContainer;

        const eventContext = new EventContext(
            client,
            event,
            childContainer,
            this.databaseManager.newEntityManager,
        )

        eventContext.container.bind(EventContext).toConstantValue(eventContext);

        return eventContext;
    }
}