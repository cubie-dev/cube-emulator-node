import { Response } from '../Response.js';
import { ResponseHeader } from '../ResponseHeader.js';
import { Room } from '../../../../database/entities/Room.js';

/**
 * @see nitro/communication/messages/parser/navigator/NavigatorSearchParser.ts
 */
export class NavigatorSearchResponse extends Response {
    public constructor(
        private contextCode: string,
        private rooms: Room[]
    ) {
        super(ResponseHeader.NAVIGATOR_SEARCH);

        this.addData(contextCode);
        this.addData(''); //_data
        this.addData(rooms.length);

        rooms.forEach((room: Room) => {

        })
    }
}
