import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';
import { Room } from '../../../../database/entities/Room';

/**
 * @see nitro/communication/messages/parser/navigator/NavigatorSearchParser.ts
 */
export class NavigatorSearchResponse extends Response {
    public static THUMBNAIL_BITMASK = 1;
    public static GROUPDATA_BITMASK = 2;
    public static ROOMAD_BITMASK = 4;
    public static SHOWOWNER_BITMASK = 8;
    public static ALLOW_PETS_BITMASK = 16;
    public static DISPLAY_ROOMAD_BITMASK = 32;

    public static OPEN_STATE = 0;
    public static DOORBELL_STATE = 1;
    public static PASSWORD_STATE = 2;
    public static INVISIBLE_STATE = 3;
    public static NOOB_STATE = 4;

    public constructor(
        private contextCode: string,
        private roomsPerCategory: Record<string, Room[]>
    ) {
        super(ResponseHeader.NAVIGATOR_SEARCH);

        this.addData(this.contextCode);
        this.addData(''); //_data, whatever that may be
        this.addData(Object.keys(this.roomsPerCategory).length);

        Object.keys(this.roomsPerCategory).forEach((category) => {
            this.addCategory(category, this.roomsPerCategory[category]!);
        });
    }

    private addCategory(category: string, rooms: Room[]): void {
        this.addData(category);

        this.addData(''); // data
        this.addData(1); //action
        this.addData(false); // closed
        this.addData(0); //mode

        this.addData(rooms?.length || 0);

        if (!rooms) {
            return;
        }

        rooms.forEach((room: Room) => {
            this.addRoom(room);
        });
    }

    private addRoom(room: Room) {
        this.addData(room.id); //id
        this.addData(room.name); //name
        this.addData(room.owner?.id || 1); //owner id
        this.addData(room.owner?.username || 'Pietje'); //owner name
        this.addData(0); //door mode
        this.addData(1); //user count
        this.addData(255); //max user count
        this.addData('Lorem ipsum'); // description
        this.addData(1); // trade mode
        this.addData(12345); // score
        this.addData(4321); // ranking
        this.addData(room.category.id); // category id

        //tags
        this.addData(0); //tags count

        //bit mask stuff
        this.addData(0);
    }
}
