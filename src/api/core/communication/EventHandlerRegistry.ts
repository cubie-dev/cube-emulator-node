import { EventHandler } from '../../../core/communication/messages/events/EventHandler';
import { type Class } from '../../../core/support/types/Class';

export interface IEventHandlerRegistry {
    overwriteHandlers(handlers: Map<number, Class<EventHandler>>): void;
    getByHeader(key: number): Class<EventHandler>;
}

export const EVENT_HANDLER_REGISTRY_TOKEN = Symbol.for('IEventHandlerRegistry');
