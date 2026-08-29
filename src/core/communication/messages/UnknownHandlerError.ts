export class UnknownHandlerError extends Error {
    public constructor() {
        super('Unknown package');
    }
}