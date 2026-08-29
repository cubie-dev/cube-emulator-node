import { type IEventHandlerRegistry } from '../../../api/core/communication/EventHandlerRegistry';
import { EventHandler } from './events/EventHandler';
import { type Class } from '../../support/types/Class';

export class EventHandlerRegistry implements IEventHandlerRegistry {
    private handlers: Map<number, Class<EventHandler>> = new Map();

    public getByHeader(header: number): Class<EventHandler> | undefined {
        return this.handlers.get(header);
    }

    public overwriteHandlers(handlers: Map<number, Class<EventHandler>>) {
        this.handlers = new Map(handlers);
    }
}
