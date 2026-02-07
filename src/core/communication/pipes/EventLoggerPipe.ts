import { Destination, PipeFunction, PipeClass } from '../../support/pipeline/Pipeline';
import { Event } from '../messages/events/Event';
import { Response } from '../messages/responses/Response';
import { R } from 'tsx/dist/types-Cxp8y2TL';
import { inject } from 'inversify';
import { ILogger, LOGGER_TOKEN } from '../../../api/core/logger/Logger';
import { LogLevel } from '../../logging/LogLevel';
import { EventContext } from '../messages/events/EventContext';

export class EventLoggerPipe implements PipeClass<EventContext, Response> {
    public constructor(
        @inject(LOGGER_TOKEN) private logger: ILogger,
    ) {
    }

    public async handle(eventContext: EventContext, next: Destination<EventContext, Response>): Promise<Response[] | Response | null> {
        this.logger.log(
            'Network',
            LogLevel.INFO,
            `Got header: ${eventContext.event.header}`
        );

        const response = await next(eventContext);

        const responses = Array.isArray(response) ? response : [response];

        for (const response of responses) {
            if (! response) {
                this.logger.log(
                    'Network',
                    LogLevel.WARN,
                    `No response to send back.`
                );
                continue;
            }

            this.logger.log(
                'Network',
                LogLevel.INFO,
                `Sending response header: ${response.header} back.`
            );
        }

        return response;
    }
}
