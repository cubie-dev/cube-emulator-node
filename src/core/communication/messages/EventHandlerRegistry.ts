import type { IEventHandlerRegistry } from '../../../api/core/communication/IncomingMessageHandlerRegistry.js';
import { EventHandler } from './events/EventHandler.js';
import { Class } from '../../support/types/Class';

export class EventHandlerRegistry implements IEventHandlerRegistry {
    private handlers: Map<number, Class<EventHandler>> = new Map();

    public getByHeader(header: number): Class<EventHandler> {
        return this.handlers.get(header);
    }

    public overwriteHandlers(handlers: Map<number, Class<EventHandler>>) {
        handlers.forEach((value: Class<EventHandler>, key: number) => {
            this.handlers.set(key, value);
        });
    }
}
