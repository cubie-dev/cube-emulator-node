export interface ILogger {
    log(context: string, level: string, message: string): void;
}

export const LOGGER_TOKEN = Symbol.for('ILogger');
