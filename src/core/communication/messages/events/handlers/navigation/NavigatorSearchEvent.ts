import { Event } from '../../Event.js';
import { EventHandler } from '../../EventHandler.js';
import { EventContext } from '../../EventContext.js';
import { NavigatorSearchResponse } from '../../../responses/navigator/NavigatorSearchResponse.js';
import { Room } from '../../../../../database/entities/Room.js';

export class NavigatorSearchEvent extends EventHandler {

    public async handle(eventContext: EventContext): Promise<NavigatorSearchResponse> {
        const navigatorContextCode = eventContext.event.reader.readString();
        const query = eventContext.event.reader.readString();

        // requesting all rooms in the view
        const rooms = await eventContext.em
            .getRepository(Room)
            .getPublicRooms();

        return new NavigatorSearchResponse(
            navigatorContextCode,
            rooms,
        );
    }
}
