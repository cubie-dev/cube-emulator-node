import { ILogger } from '../../api/core/logger/Logger';
import { createLogger, Logger, format, transports } from 'winston';
import { Format } from 'logform'
import * as Transport from 'winston-transport';

export class WinstonLogger implements ILogger {
    private winston: Logger;

    public constructor() {
        this.winston = createLogger({
            transports: this.createLoggerTransport(),
            format: this.createFormat(),
            levels: {
                error: 0,
                warn: 1,
                info: 2,
                success: 3,
            }
        })
    }

    private createLoggerTransport(): Transport[] {
        return [
            new transports.File({
                level: 'warning',
                format: format.combine(format.uncolorize()),
                filename: 'emulator.logs'
            }),
            new transports.Console({
                level: 'success',
            })
        ];
    }

    private createFormat(): Format {
        return format.combine(
            format.colorize({
                all: true,
                colors: {
                    error: 'red',
                    warn: 'yellow',
                    info: 'blue',
                    success: 'green'
                }
            }),
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss',
            }),
            format.printf(info => `[${info.timestamp}][${info.context}][${info.level}]: ${info.message}`)
        )
    }

    public log(context: string, level: string, message: string) {
        this.winston.log({
            level,
            message,
            context,
        })
    }
}
