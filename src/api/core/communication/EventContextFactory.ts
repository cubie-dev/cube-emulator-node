import type { EventContext } from '../../../core/communication/messages/events/EventContext.ts';
import type { Client } from '../../../core/communication/Client.ts';
import { Event } from '../../../core/communication/messages/events/Event.ts';


export interface IEventContextFactory {
    create(client: Client, event: Event): EventContext;
}

export const EVENT_CONTEXT_FACTORY_TOKEN = Symbol.for('EventContextFactory');