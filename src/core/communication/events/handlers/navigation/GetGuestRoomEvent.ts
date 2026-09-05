import { EventHandler } from '../../EventHandler.ts';
import type { EventContext } from '../../EventContext.ts';
import type { Response } from '../../../responses/Response.ts';
import { GuestRoomResultResponse } from '../../../responses/navigator/GuestRoomResultResponse.ts';

export class GetGuestRoomEventHandler extends EventHandler {
    public override async handle(eventContext: EventContext): Promise<GuestRoomResultResponse> {
        const roomId = eventContext.event.reader.readInt();
        const boolA = eventContext.event.reader.readByte() === 1; // no idea
        const boolB = eventContext.event.reader.readByte() === 1; // no idea

        console.log(roomId, boolA, boolB);

        return new GuestRoomResultResponse();
    }
}