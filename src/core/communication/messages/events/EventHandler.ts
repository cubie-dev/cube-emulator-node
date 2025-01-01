import { Event } from './Event';
import { Response } from '../responses/Response';
import { EventContext } from './EventContext';

export abstract class EventHandler {
    public abstract handle(event: Event, context: EventContext): Promise<Response|Response[]>|Response|Response[]|null;
}
