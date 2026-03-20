import { Response } from '../Response.js';
import { ResponseHeader } from '../ResponseHeader.js';

export class NavigatorMetaDataResponse extends Response {
    public constructor() {
        super(ResponseHeader.NAVIGATOR_METADATA);

        this.addData(4);
        this.addData('official_view')
        this.addData(0);
        this.addData('hotel_view');
        this.addData(0);
        this.addData('roomads_view');
        this.addData(0);
        this.addData('myworld_view');
        this.addData(0);
    }
}
