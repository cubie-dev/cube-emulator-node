import { Response } from '../responses/Response.js';
import { EventContext } from './EventContext.js';

export abstract class EventHandler {
    public abstract handle(eventContext: EventContext): Promise<Response|Response[]|null>|Response|Response[]|null;
}
