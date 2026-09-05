import { Composer } from '../Composer.ts';
import { ComposerHeader } from '../ComposerHeader.ts';
import { type NavigatorCategory } from '../../../database/entities/NavigatorCategory';

export class NavigatorCategoriesComposer extends Composer {
    public constructor(categories: NavigatorCategory[]) {
        super(ComposerHeader.NAVIGATOR_CATEGORIES);

        this.appendData(categories.length);

        for (const category of categories) {
            this.appendData(category.id);
            this.appendData(category.name);
            this.appendData(category.visible);
            this.appendData(category.automatic);
            this.appendData(category.automaticCategoryKey);
            this.appendData(category.globalCategoryKey);
            this.appendData(category.staffOnly);
        }
    }
}
