export const isMapLike = (check: unknown): check is Record<string | number, unknown> => {
    return typeof check === 'object' &&
        check !== null &&
        !Array.isArray(check) &&
        Object.getPrototypeOf(check) === Object.prototype;
}
