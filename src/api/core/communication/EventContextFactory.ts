import { Client } from '../../../core/communication/Client';
import { EventContext } from '../../../core/communication/messages/events/EventContext';

export interface IEventContextFactory {
    makeForClient(client: Client): EventContext;
}

export const EVENT_CONTEXT_FACTORY_TOKEN = Symbol.for('IEventContextFactory');
