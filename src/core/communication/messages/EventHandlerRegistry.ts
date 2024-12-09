import { IEventHandlerRegistry } from '../../../api/core/communication/IncomingMessageHandlerRegistry';
import { Class } from 'utility-types';
import { EventHandler } from './events/EventHandler';

export class EventHandlerRegistry implements IEventHandlerRegistry {
    private _handlers: Map<number, Class<EventHandler>> = new Map();

    public getByHeader(header: number): Class<EventHandler> {
        return this._handlers.get(header);
    }

    public overwriteHandlers(handlers: Map<number, Class<EventHandler>>) {
        handlers.forEach((value: Class<EventHandler>, key: number) => {
            this._handlers.set(key, value);
        });
    }
}
