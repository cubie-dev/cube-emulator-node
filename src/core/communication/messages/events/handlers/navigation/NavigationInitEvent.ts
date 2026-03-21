import { EventContext } from '../../EventContext.js';
import { Response } from '../../../responses/Response.js';
import { NavigatorMetaDataResponse } from '../../../responses/navigator/NavigatorMetaDataResponse.js';
import { EventHandler } from '../../EventHandler.js';

export class NavigationInitEvent extends EventHandler {
    public handle(_context: EventContext): Response[] {
        return [
            new NavigatorMetaDataResponse(),
        ]
    }
}
