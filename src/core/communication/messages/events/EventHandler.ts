import { Event } from './Event';
import { Response } from '../responses/Response';
import { EventContext } from './EventContext';

export abstract class EventHandler {
    public abstract handle(eventContext: EventContext): Promise<Response|Response[]|null>|Response|Response[]|null;
}
