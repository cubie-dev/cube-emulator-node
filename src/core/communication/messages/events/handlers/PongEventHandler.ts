import { EventHandler } from '../EventHandler';
import { EventContext } from '../EventContext';

/**
 * {Description} The client sends every x seconds a pong to keep the connection alive.
 */
export class PongEventHandler extends EventHandler {
    public handle(context: EventContext): null {
        context.client.lastPong = Date.now();

        return null;
    }
}
