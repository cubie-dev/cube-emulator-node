import { IEventHandlersRegistry } from '../../../api/core/communication/IncomingMessageHandlerRegistry';
import { Class } from 'utility-types';
import { EventHandler } from './events/EventHandler';

export class IncomingMessageHandlerRegistry implements IEventHandlersRegistry {
    private _handlers: Map<number, Class<EventHandler>> = new Map();

    public getByHeader(key: number): Class<EventHandler> {
        return this._handlers.get(key);
    }

    public overwriteHandlers(handlers: Map<number, Class<EventHandler>>) {
        handlers.forEach((value: Class<EventHandler>, key: number) => {
            this._handlers.set(key, value);
        });
    }
}
