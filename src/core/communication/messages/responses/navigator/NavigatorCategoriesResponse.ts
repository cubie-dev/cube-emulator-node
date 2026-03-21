import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';

export class NavigatorCategoriesResponse extends Response {
    public constructor() {
        super(ResponseHeader.NAVIGATOR_CATEGORIES);
    }
}
