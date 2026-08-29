/**
 * Prefixes the client may put in front of a navigator search, as in `owner:John`.
 * Each one narrows the search to a single column instead of the room name.
 */
export enum SearchCategory {
    ROOM_NAME = 'roomname',
    OWNER = 'owner',
    TAG = 'tag',
    GROUP = 'group',
}

export interface SearchQuery {
    category: SearchCategory;
    value: string;
}

const CATEGORIES: string[] = Object.values(SearchCategory);

/**
 * Splits `owner:John` into its category and value. Anything without a recognised
 * prefix is searched on the room name as a whole, so a room genuinely called
 * `foo:bar` stays findable by typing its name.
 */
export const parseSearchQuery = (query: string): SearchQuery | null => {
    const trimmed = query.trim();

    if (!trimmed) {
        return null;
    }

    const separator = trimmed.indexOf(':');
    const prefix = trimmed.slice(0, separator).toLowerCase();
    const value = trimmed.slice(separator + 1).trim();

    if (separator === -1 || !CATEGORIES.includes(prefix) || !value) {
        return {
            category: SearchCategory.ROOM_NAME,
            value: trimmed,
        };
    }

    return {
        category: prefix as SearchCategory,
        value,
    };
}
