import { EventHandler } from '../EventHandler';
import { Response } from '../../responses/Response';
import { Event } from '../Event';
import { EventContext } from '../EventContext';

export class ReleaseVersionEventHandler extends EventHandler {
    public handle(_event: Event, _context: EventContext): Response {
        return null;
    }
}
