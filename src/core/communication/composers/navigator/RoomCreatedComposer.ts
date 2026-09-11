import { Composer } from '../Composer.ts';
import { ComposerHeader } from '../ComposerHeader.ts';

export class RoomCreatedComposer extends Composer {
    public constructor(roomId: number, roomName: string) {
        super(ComposerHeader.ROOM_CREATED);

        this.appendData(roomId);
        this.appendData(roomName);
    }
}
