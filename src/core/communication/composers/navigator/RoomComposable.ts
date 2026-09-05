import { Composable } from '../Composable.ts';
import type { ComposableData } from '../../ComposableData.ts';
import type { Room } from '../../../database/entities/Room.ts';

export class RoomComposable extends Composable {
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
        private readonly room: Room,
    ) {
        super();
    }

    public getData(): ComposableData[] {
        return [
            this.room.id,
            this.room.name,
            this.room.owner.id,
            this.room.owner.username,
            0, // door mode
            1, // user count
            this.room.maxUserCount,
            this.room.description,
            1, // trade mode
            this.room.score,
            this.room.ranking,
            this.room.category.id,
            ...this.tagsData(),
            ...this.bitMaskData(),
        ];
    }

    private tagsData(): ComposableData[] {
        const tags = this.room.tags?.split(';') || [];
        return [tags.length, ...tags];
    }

    /**
     * The client reads the mask as an int and then reads back only the fields whose
     * bit is set, so these writes have to stay in the same order the flags are
     * checked in `parseBitMask`: thumbnail, then group data, then the room ad.
     *
     * @see nitro/communication/messages/parser/navigator/RoomDataParser.ts#parseBitMask
     */
    private bitMaskData(): ComposableData[] {
        const adExpiresIn = this.adExpiresIn();
        const hasAd = Boolean(this.room.adName) && adExpiresIn > 0;

        let bitMask = 0;

        if (this.room.officialPictureRef) {
            bitMask |= RoomComposable.THUMBNAIL_BITMASK;
        }

        // ROOMAD puts the ad fields on the wire, DISPLAY_ROOMAD tells the client to
        // actually render them; an expired ad is worth neither.
        if (hasAd) {
            bitMask |= RoomComposable.ROOMAD_BITMASK;
            bitMask |= RoomComposable.DISPLAY_ROOMAD_BITMASK;
        }

        if (this.room.showOwner) {
            bitMask |= RoomComposable.SHOWOWNER_BITMASK;
        }

        if (this.room.allowPets) {
            bitMask |= RoomComposable.ALLOW_PETS_BITMASK;
        }

        const data: ComposableData[] = [bitMask];

        if (this.room.officialPictureRef) {
            data.push(this.room.officialPictureRef);
        }

        // GROUPDATA_BITMASK stays unset on purpose: it owes the client a group id,
        // name and badge, and groups are not modelled yet. Set the flag and write
        // those three here once they are.

        if (hasAd) {
            data.push(this.room.adName!);
            data.push(this.room.adDescription ?? '');
            data.push(adExpiresIn);
        }

        return data;
    }

    /**
     * Minutes left on the room ad, which is what the client counts down with. Rounded
     * up so that any ad still in the future reports at least one minute — flooring
     * would report 0 for the final minute and hide an ad that has not expired yet.
     */
    private adExpiresIn(): number {
        if (!this.room.adExpiresAt) {
            return 0;
        }

        return Math.max(0, Math.ceil((this.room.adExpiresAt.getTime() - Date.now()) / 60_000));
    }
}