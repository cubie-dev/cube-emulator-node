import { ILogger } from '../../api/core/logger/Logger';
import { createLogger, Logger, format, transports } from 'winston';
import { Format } from 'logform'

export class WinstonLogger implements ILogger {
    private _winston: Logger;

    public constructor() {
        this._winston = createLogger({
            transports: this.createLoggerTransport(),
            format: this.createFormat(),
        })
    }

    private createLoggerTransport(): any[] {
        return [
            new transports.File({
                level: 'warning',
                format: format.combine(format.uncolorize()),
                filename: 'emulator.logs'
            }),
            new transports.Console()
        ];
    }

    private createFormat(): Format {
        return format.combine(
            format.colorize({
                level: true,
            }),
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.printf(info => `[${info.timestamp}][${info.context}][${info.level}]: ${info.message}`)
        )
    }

    public log(context: string, level: string, message: string) {
        this._winston.log({
            level,
            message,
            context,
        })
    }
}
