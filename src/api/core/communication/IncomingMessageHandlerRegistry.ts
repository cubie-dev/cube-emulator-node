import { EventHandler } from '../../../core/communication/messages/events/EventHandler';
import { Class } from 'utility-types';

export interface IEventHandlersRegistry {
    overwriteHandlers(handlers: Map<number, Class<EventHandler>>): void;
    getByHeader(key: number): Class<EventHandler>;
}

export const EVENT_HANDLERS_REGISTRY_TOKEN = Symbol.for('IEventHandlersRegistry');
