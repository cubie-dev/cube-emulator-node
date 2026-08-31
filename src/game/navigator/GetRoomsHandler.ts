import type { EntityManager } from '@mikro-orm/postgresql';
import { injectable } from 'inversify';
import { Room } from '../../core/database/entities/Room';
import { parseSearchQuery, SearchCategory, type SearchQuery } from './SearchCategory';
import type { FilterQuery } from '@mikro-orm/core';
import { User } from '../../core/database/entities/User';
import { EventContext } from '../../core/communication/events/EventContext';

@injectable()
export class GetRoomsHandler {
    public constructor(
        private readonly eventContext: EventContext,
    ) {}

    public async handle(
        user: User,
        view: string,
        searchQuery: string = '',
    ): Promise<Room[]> {
        // requesting the rooms in the view that match the search
        const viewFilter = this.viewFilter(view);

        if (!viewFilter) {
            return [];
        }

        const search = parseSearchQuery(searchQuery);

        // Groups are not modelled yet, so a group search can never match a room.
        if (search?.category === SearchCategory.GROUP) {
            return [];
        }

        const matches = this.searchFilter(search);

        return this.eventContext
            .em
            .getRepository(Room)
            .find(
                matches ? { $and: [viewFilter, matches] } : viewFilter,
                { populate: ['category', 'owner'] }
            );
    }

    /**
     * The set of rooms the requested view is allowed to show, before searching.
     * An unknown view — or `myworld_view` for a client without a user — shows none.
     */
    private viewFilter(view: string): FilterQuery<Room> | null {
        if (view === 'official_view') {
            return { isPublic: true };
        }

        if (view === 'hotel_view') {
            return { isPublic: false };
        }

        if (view === 'myworld_view' && this.eventContext.client.user) {
            return { owner: this.eventContext.client.user.id };
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