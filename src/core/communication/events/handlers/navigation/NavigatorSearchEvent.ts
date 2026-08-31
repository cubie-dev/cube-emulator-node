import { EventHandler } from '../../EventHandler';
import { EventContext } from '../../EventContext';
import { NavigatorSearchResponse } from '../../../responses/navigator/NavigatorSearchResponse';
import { Room } from '../../../../database/entities/Room';
import { parseSearchQuery, SearchCategory, type SearchQuery } from '../../../../../game/navigator/SearchCategory';
import { type FilterQuery } from '@mikro-orm/core';
import { GetRoomsHandler } from '../../../../../game/navigator/GetRoomsHandler';
import { injectable } from 'inversify';

@injectable()
export class NavigatorSearchEvent extends EventHandler {
    public constructor(
        private readonly getRoomsHandler: GetRoomsHandler
    ) {
        super();
    }

    public async handle(eventContext: EventContext): Promise<NavigatorSearchResponse | null> {
        const requestedView = eventContext.event.reader.readString();
        const searchQuery = eventContext.event.reader.readString();

        if (! eventContext.client.user) {
            return null;
        }

        const rooms = await this.getRoomsHandler.handle(
            eventContext.client.user,
            requestedView,
            searchQuery,
        );

        const roomsPerCategory = rooms.reduce<Record<string, Room[]>>((acc, room) => {
            const category = room.category.name;

            if (!acc[category]) {
                acc[category] = [];
            }

            acc[category].push(room);

            return acc;
        }, {});

        return new NavigatorSearchResponse(
            requestedView,
            searchQuery,
            roomsPerCategory,
        );
    }
}
