import { EventHandler } from '../EventHandler';
import { Event } from '../Event';
import { EventContext } from '../EventContext';
import { PongResponse } from '../../responses/PongResponse';

export class PongEventHandler extends EventHandler {
    public handle(_event: Event, _context: EventContext): PongResponse {
        return null;
    }
}
