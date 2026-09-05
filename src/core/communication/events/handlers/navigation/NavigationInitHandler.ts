import { type EventContext } from '../../EventContext';
import { type Composer } from '../../../composers/Composer.ts';
import { NavigatorMetaDataComposer } from '../../../composers/navigator/NavigatorMetaDataComposer.ts';
import { NavigatorCategoriesComposer } from '../../../composers/navigator/NavigatorCategoriesComposer.ts';
import { NavigatorCategory } from '../../../../database/entities/NavigatorCategory';
import { EventHandler } from '../../EventHandler';

export class NavigationInitHandler extends EventHandler {
    public async handle(context: EventContext): Promise<Composer[]> {
        const categories = await context.em.findAll(NavigatorCategory);

        return [
            new NavigatorMetaDataComposer(),
            new NavigatorCategoriesComposer(categories),
        ];
    }
}
