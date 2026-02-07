import { EventHandler } from '../EventHandler.js';
import { Response } from '../../responses/Response.js';
import { EventContext } from '../EventContext.js';

export class ReleaseVersionEventHandler extends EventHandler {
    public handle(_context: EventContext): null {
        return null;
    }
}
