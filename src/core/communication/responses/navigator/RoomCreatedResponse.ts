import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';

export class RoomCreatedResponse extends Response {
    public constructor(roomId: number, roomName: string) {
        super(ResponseHeader.ROOM_CREATED);

        this.addData(roomId);
        this.addData(roomName);
    }
}
