import type { EventContext } from '../../../core/communication/events/EventContext';
import type { Client } from '../../../core/communication/Client';
import { Event } from '../../../core/communication/events/Event';


export interface IEventContextFactory {
    create(client: Client, event: Event): EventContext;
}

export const EVENT_CONTEXT_FACTORY_TOKEN = Symbol.for('EventContextFactory');