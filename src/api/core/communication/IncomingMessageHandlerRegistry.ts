import { EventHandler } from '../../../core/communication/messages/events/EventHandler';
import { Class } from 'utility-types';

export interface IEventHandlerRegistry {
    overwriteHandlers(handlers: Map<number, Class<EventHandler>>): void;
    getByHeader(key: number): Class<EventHandler>;
}

export const EVENT_HANDLER_REGISTRY_TOKEN = Symbol.for('IEventHandlerRegistry');
