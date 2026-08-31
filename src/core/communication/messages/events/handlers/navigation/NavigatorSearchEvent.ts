import { EventHandler } from '../../EventHandler';
import { EventContext } from '../../EventContext';
import { NavigatorSearchResponse } from '../../../responses/navigator/NavigatorSearchResponse';
import { Room } from '../../../../../database/entities/Room';
import { parseSearchQuery, SearchCategory, type SearchQuery } from './SearchCategory';
import { type FilterQuery } from '@mikro-orm/core';

export class NavigatorSearchEvent extends EventHandler {
    public async handle(eventContext: EventContext): Promise<NavigatorSearchResponse> {
        const requestedView = eventContext.event.reader.readString();
        const searchQuery = eventContext.event.reader.readString();

        // requesting the rooms in the view that match the search
        const rooms = await this.getRooms(eventContext, requestedView, searchQuery);

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

    private async getRooms(eventContext: EventContext, requestedView: string, query: string): Promise<Room[]> {
        const view = this.viewFilter(eventContext, requestedView);

        if (!view) {
            return [];
        }

        const search = parseSearchQuery(query);

        // Groups are not modelled yet, so a group search can never match a room.
        if (search?.category === SearchCategory.GROUP) {
            return [];
        }

        const matches = this.searchFilter(search);

        return eventContext.em
            .getRepository(Room)
            .find(
                matches ? { $and: [view, matches] } : view,
                { populate: ['category', 'owner'] }
            );
    }

    /**
     * The set of rooms the requested view is allowed to show, before searching.
     * An unknown view — or `myworld_view` for a client without a user — shows none.
     */
    private viewFilter(eventContext: EventContext, requestedView: string): FilterQuery<Room> | null {
        if (requestedView === 'official_view') {
            return { isPublic: true };
        }

        if (requestedView === 'hotel_view') {
            return { isPublic: false };
        }

        if (requestedView === 'myworld_view' && eventContext.client.user) {
            return { owner: eventContext.client.user.id };
        }

        return null;
    }

    /**
     * Turns the parsed query into the column it searches on. Matching is a
     * case-insensitive substring so that partial names find their room.
     */
    private searchFilter(search: SearchQuery | null): FilterQuery<Room> | null {
        if (!search) {
            return null;
        }

        const value = this.escapeLike(search.value);

        if (! value) {
            return null;
        }

        if (search.category === SearchCategory.OWNER) {
            return { owner: { username: { $ilike: `%${value}%` } } };
        }

        if (search.category === SearchCategory.TAG) {
            return this.tagFilter(value);
        }

        return { name: { $ilike: `%${value}%` } };
    }

    /**
     * Tags live in one `;` separated column, so a tag only matches when the value
     * sits between separators — otherwise searching `pet` would find `pets`.
     */
    private tagFilter(value: string): FilterQuery<Room> {
        return {
            $or: [
                { tags: { $ilike: value } },
                { tags: { $ilike: `${value};%` } },
                { tags: { $ilike: `%;${value}` } },
                { tags: { $ilike: `%;${value};%` } },
            ],
        };
    }

    /**
     * `%` and `_` are wildcards to LIKE, so a user typing them would widen their own
     * search instead of looking for the characters themselves.
     */
    private escapeLike(value: string): string {
        return value.replace(/[\\%_]/g, '\\$&');
    }
}
