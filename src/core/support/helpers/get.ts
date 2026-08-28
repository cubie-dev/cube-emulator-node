export type PathSegment = string | number;
export type Path = string | Array<PathSegment>;

const PATH_PATTERN = /[^.[\]]+|\[(?:(-?\d+)|(["'])((?:(?!\2)[^\\]|\\.)*)\2)\]/g;
const ESCAPE_PATTERN = /\\(.)/g;

/**
 * Splits a dot/bracket notation path into its separate segments.
 *
 * `'rooms[0].owner["display.name"]'` becomes `['rooms', '0', 'owner', 'display.name']`
 */
export const toPath = (path: Path): Array<PathSegment> => {
    if (Array.isArray(path)) {
        return path;
    }

    const segments: Array<PathSegment> = [];
    let match: RegExpExecArray | null;

    PATH_PATTERN.lastIndex = 0;

    while ((match = PATH_PATTERN.exec(path)) !== null) {
        const [ segment, index, , quoted ] = match;

        if (index !== undefined) {
            segments.push(index);
        } else if (quoted !== undefined) {
            segments.push(quoted.replace(ESCAPE_PATTERN, '$1'));
        } else {
            segments.push(segment);
        }
    }

    return segments;
}

/**
 * Reads a nested value from an object using dot notation, falling back to
 * `defaultValue` when the path cannot be resolved.
 */
export const get = <T>(object: any, path: Path, defaultValue: T | null = null): T => {
    const segments = toPath(path);

    if (segments.length === 0) {
        return defaultValue as T;
    }

    let current = object;

    for (const segment of segments) {
        if (current === null || current === undefined) {
            return defaultValue as T;
        }

        current = current[segment];
    }

    return current === undefined ? defaultValue as T : current;
}
