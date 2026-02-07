import { EventHandler } from '../EventHandler';
import { Event } from '../Event';
import { EventContext } from '../EventContext';
import { PingResponse } from '../../responses/PingResponse';

export class PongEventHandler extends EventHandler {
    public handle(_event: Event, context: EventContext): PingResponse {
        context.client.lastPong = Date.now();

        return null;
    }
}
