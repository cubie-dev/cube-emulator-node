import { type EventContext } from '../../EventContext';
import { EventHandler } from '../../EventHandler';
import { RoomCreatedResponse } from '../../../responses/navigator/RoomCreatedResponse';
import { Room } from '../../../../database/entities/Room';
import { NavigatorCategory } from '../../../../database/entities/NavigatorCategory';
import { TradeType } from '../../../../database/enums/TradeType';

export class RoomCreateEvent extends EventHandler {
    public async handle(eventContext: EventContext): Promise<RoomCreatedResponse | null> {
        const { reader } = eventContext.event;
        const { em, client } = eventContext;

        if (!client.user) {
            return null;
        }

        const roomName = reader.readString();
        const description = reader.readString();
        const model = reader.readString();
        const categoryId = reader.readInt();
        const maxUserCount = reader.readInt();
        const tradeType = reader.readInt() as TradeType;

        const category = await em.findOne(NavigatorCategory, { id: categoryId });

        if (!category) {
            return null;
        }

        const room = em.create(Room, {
            name: roomName,
            description,
            model,
            category,
            maxUserCount,
            tradeType,
            owner: client.user,
        });

        await em.flush();

        return new RoomCreatedResponse(room.id, room.name);
    }
}
