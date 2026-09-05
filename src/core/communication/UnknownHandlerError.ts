export class UnknownHandlerError extends Error {
    public constructor(header: number) {
        super(`Unknown handler for header ${header}`);
    }
}
