import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';
import { Room } from '../../../database/entities/Room';

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
        contextCode: string,
        searchQuery: string,
        roomsPerCategory: Record<string, Room[]>
    ) {
        super(ResponseHeader.NAVIGATOR_SEARCH);

        this.addData(contextCode);
        this.addData(searchQuery);
        this.addData(Object.keys(roomsPerCategory).length);

        Object.keys(roomsPerCategory).forEach((category) => {
            this.addCategory(category, roomsPerCategory[category]!);
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
        this.addData(room.owner.id); //owner id
        this.addData(room.owner.username); //owner name
        this.addData(0); //door mode
        this.addData(1); //user count
        this.addData(room.maxUserCount); //max user count
        this.addData(room.description); // description
        this.addData(1); // trade mode
        this.addData(room.score); // score
        this.addData(room.ranking); // ranking
        this.addData(room.category.id); // category id

        //tags
        this.addTags(room);

        this.addBitMask(room);
    }

    private addTags(room: Room): void {
        const tags = room.tags?.split(';') || [];

        this.addData(tags.length);

        tags.forEach(tag => {
            this.addData(tag);
        })
    }

    /**
     * The client reads the mask as an int and then reads back only the fields whose
     * bit is set, so these writes have to stay in the same order the flags are
     * checked in `parseBitMask`: thumbnail, then group data, then the room ad.
     *
     * @see nitro/communication/messages/parser/navigator/RoomDataParser.ts#parseBitMask
     */
    private addBitMask(room: Room): void {
        const adExpiresIn = this.adExpiresIn(room);
        const hasAd = Boolean(room.adName) && adExpiresIn > 0;

        let bitMask = 0;

        if (room.officialPictureRef) {
            bitMask |= NavigatorSearchResponse.THUMBNAIL_BITMASK;
        }

        // ROOMAD puts the ad fields on the wire, DISPLAY_ROOMAD tells the client to
        // actually render them; an expired ad is worth neither.
        if (hasAd) {
            bitMask |= NavigatorSearchResponse.ROOMAD_BITMASK;
            bitMask |= NavigatorSearchResponse.DISPLAY_ROOMAD_BITMASK;
        }

        if (room.showOwner) {
            bitMask |= NavigatorSearchResponse.SHOWOWNER_BITMASK;
        }

        if (room.allowPets) {
            bitMask |= NavigatorSearchResponse.ALLOW_PETS_BITMASK;
        }

        this.addData(bitMask);

        if (room.officialPictureRef) {
            this.addData(room.officialPictureRef);
        }

        // GROUPDATA_BITMASK stays unset on purpose: it owes the client a group id,
        // name and badge, and groups are not modelled yet. Set the flag and write
        // those three here once they are.

        if (hasAd) {
            this.addData(room.adName);
            this.addData(room.adDescription ?? '');
            this.addData(adExpiresIn);
        }
    }

    /**
     * Minutes left on the room ad, which is what the client counts down with. Rounded
     * up so that any ad still in the future reports at least one minute — flooring
     * would report 0 for the final minute and hide an ad that has not expired yet.
     */
    private adExpiresIn(room: Room): number {
        if (!room.adExpiresAt) {
            return 0;
        }

        return Math.max(0, Math.ceil((room.adExpiresAt.getTime() - Date.now()) / 60_000));
    }
}
