import { Event } from '../../Event';
import { EventHandler } from '../../EventHandler';
import { EventContext } from '../../EventContext';
import { NavigatorSearchResponse } from '../../../responses/navigator/NavigatorSearchResponse';
import { Room } from '../../../../../database/entities/Room';

export class NavigatorSearchEvent extends EventHandler {

    public async handle(eventContext: EventContext): Promise<NavigatorSearchResponse> {
        const navigatorContextCode = eventContext.event.reader.readString();
        const query = eventContext.event.reader.readString();

        //The frontend can handle multiple result categories.
        // Except for our own world, we will group rooms by their category

        // requesting all rooms in the view
        const rooms = await this.getRooms(eventContext, navigatorContextCode, query);

        const roomsPerCategory = rooms.reduce<Record<string, Room[]>>((acc, room) => {
            const category = room.category.name;

            if (!acc[category]) {
                acc[category] = [];
            }

            acc[category].push(room);

            return acc;
        }, {});

        return new NavigatorSearchResponse(
            navigatorContextCode,
            roomsPerCategory,
        );
    }

    private async getRooms(eventContext: EventContext, context: string, query: string): Promise<Room[]> {
        if (context === 'official_view') {
            return eventContext.em
                .getRepository(Room)
                .find(
                    { owner: null },
                    { populate: ['category', 'owner'] }
                )
        }

        if (context === 'hotel_view') {
            return eventContext.em
                .getRepository(Room)
                .find(
                    { owner: { $exists: true } },
                    { populate: ['category', 'owner'] }
                );
        }

        if (context === 'myworld_view') {
            return eventContext.em
                .getRepository(Room)
                .find(
                    { owner: eventContext.client.user.id },
                    { populate: ['category', 'owner'] }
                );
        }

        return [];
    }
}
