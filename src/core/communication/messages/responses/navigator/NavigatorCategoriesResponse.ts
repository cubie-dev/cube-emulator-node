import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';
import { type NavigatorCategory } from '../../../../database/entities/NavigatorCategory';

export class NavigatorCategoriesResponse extends Response {
    public constructor(categories: NavigatorCategory[]) {
        super(ResponseHeader.NAVIGATOR_CATEGORIES);

        this.addData(categories.length);

        for (const category of categories) {
            this.addData(category.id);
            this.addData(category.name);
            this.addData(category.visible);
            this.addData(category.automatic);
            this.addData(category.automaticCategoryKey);
            this.addData(category.globalCategoryKey);
            this.addData(category.staffOnly);
        }
    }
}
