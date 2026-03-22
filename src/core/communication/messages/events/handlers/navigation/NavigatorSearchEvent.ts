import { Event } from '../../Event';
import { EventHandler } from '../../EventHandler';
import { EventContext } from '../../EventContext';
import { NavigatorSearchResponse } from '../../../responses/navigator/NavigatorSearchResponse';
import { Room } from '../../../../../database/entities/Room';

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
