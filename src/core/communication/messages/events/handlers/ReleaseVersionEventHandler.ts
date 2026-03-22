import { EventHandler } from '../EventHandler';
import { Response } from '../../responses/Response';
import { EventContext } from '../EventContext';

export class ReleaseVersionEventHandler extends EventHandler {
    public handle(_context: EventContext): null {
        return null;
    }
}
