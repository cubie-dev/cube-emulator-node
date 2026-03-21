import { LogLevel } from '../../../core/logging/LogLevel';

export interface ILogger {
    log(context: string, level: LogLevel, message: string): void;
}

export const LOGGER_TOKEN = Symbol.for('ILogger');
