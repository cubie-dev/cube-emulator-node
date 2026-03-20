import { Response } from '../Response.js';
import { ResponseHeader } from '../ResponseHeader.js';

export class NavigatorCategoriesResponse extends Response {
    public constructor() {
        super(ResponseHeader.NAVIGATOR_CATEGORIES);
    }
}
