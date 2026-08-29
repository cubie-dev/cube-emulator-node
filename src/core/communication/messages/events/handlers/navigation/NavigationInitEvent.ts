import { type EventContext } from '../../EventContext';
import { type Response } from '../../../responses/Response';
import { NavigatorMetaDataResponse } from '../../../responses/navigator/NavigatorMetaDataResponse';
import { NavigatorCategoriesResponse } from '../../../responses/navigator/NavigatorCategoriesResponse';
import { NavigatorCategory } from '../../../../../database/entities/NavigatorCategory';
import { EventHandler } from '../../EventHandler';

export class NavigationInitEvent extends EventHandler {
    public async handle(context: EventContext): Promise<Response[]> {
        const categories = await context.em.findAll(NavigatorCategory);

        return [
            new NavigatorMetaDataResponse(),
            new NavigatorCategoriesResponse(categories),
        ];
    }
}
