import { Composer } from '../composers/Composer.ts';
import { EventContext } from './EventContext';

export abstract class EventHandler {
    public abstract handle(eventContext: EventContext): Promise<Composer | Composer[] | null> | Composer | Composer[] | null;
}
