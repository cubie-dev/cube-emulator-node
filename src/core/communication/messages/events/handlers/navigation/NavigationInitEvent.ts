import { EventContext } from '../../EventContext';
import { Response } from '../../../responses/Response';
import { NavigatorMetaDataResponse } from '../../../responses/navigator/NavigatorMetaDataResponse';
import { EventHandler } from '../../EventHandler';

export class NavigationInitEvent extends EventHandler {
    public handle(_context: EventContext): Response[] {
        return [
            new NavigatorMetaDataResponse(),
        ]
    }
}
