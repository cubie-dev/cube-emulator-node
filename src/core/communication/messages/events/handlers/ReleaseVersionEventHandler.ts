import { EventHandler } from '../EventHandler';
import { Event } from '../Event';
import { EventContext } from '../EventContext';

export class ReleaseVersionEventHandler extends EventHandler {
    public handle(_event: Event, _context: EventContext): null {
        return null;
    }
}
