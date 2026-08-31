import { inject, injectable } from 'inversify';
import { type Destination, type PipeClass } from '../../support/pipeline/Pipeline';
import { type Response } from '../responses/Response';
import { type ILogger, LOGGER_TOKEN } from '../../../api/core/logger/Logger';
import { LogLevel } from '../../logging/LogLevel';
import { EventContext } from '../events/EventContext';

@injectable()
export class EventLoggerPipe implements PipeClass<EventContext, EventContext, Response | Response[]> {
    public constructor(
        @inject(LOGGER_TOKEN) private readonly logger: ILogger,
    ) {}

    public async handle(
        eventContext: EventContext,
        next: Destination<EventContext, Response | Response[]>,
    ): Promise<Response | Response[] | null> {
        const inspect = eventContext.event.reader.inspect();
        this.logger.log('Network', LogLevel.INFO, `[${eventContext.event.header}] ${inspect}`);

        const response = await next(eventContext);

        const responses = Array.isArray(response) ? response : [response];

        for (const r of responses) {
            if (!r) {
                this.logger.log('Network', LogLevel.WARN, 'No response to send back.');
                continue;
            }
            this.logger.log('Network', LogLevel.INFO, `Sending response header: ${r.header} back.`);
        }

        return response;
    }
}
