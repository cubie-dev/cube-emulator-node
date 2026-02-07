import { Event } from '../../Event';
import { EventHandler } from '../../EventHandler';
import { EventContext } from '../../EventContext';
import * as console from 'node:console';
import { NavigatorSearchResponse } from '../../../responses/navigator/NavigatorSearchResponse';
import { EntityManager } from '@mikro-orm/core';
import { Room } from '../../../../../database/entities/Room';
import { NavigatorCategory } from '../../../../../database/entities/NavigatorCategory';

export class NavigatorSearchEvent extends EventHandler {
    public constructor(
        private entityManager: EntityManager,
    ) {
        super();
    }

    public async handle(eventContext: EventContext): Promise<NavigatorSearchResponse> {
        const navigatorContextCode = eventContext.event.reader.readString();
        const query = eventContext.event.reader.readString();

        console.log(navigatorContextCode);

        const categories = this.entityManager.getRepository(NavigatorCategory).find({
            isPublic: navigatorContextCode === 'official_view',
        }, {
            populate: ['rooms'],
        });

        if (! query) {
            // requesting all rooms in the view
            const rooms = await this.entityManager.getRepository(
                Room
            ).getPublicRooms();

            return new NavigatorSearchResponse(
                navigatorContextCode,
                rooms
            );
        }
    }

}
