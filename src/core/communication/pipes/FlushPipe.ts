import { injectable } from 'inversify';
import { type Destination, type PipeClass } from '../../support/pipeline/Pipeline';
import { type Response } from '../responses/Response';
import { EventContext } from '../events/EventContext';

@injectable()
export class FlushPipe implements PipeClass<EventContext, EventContext, Response | Response[]> {
    public async handle(
        eventContext: EventContext,
        next: Destination<EventContext, Response | Response[]>,
    ): Promise<Response | Response[] | null> {
        const response = await next(eventContext);

        await eventContext.em.flush();

        return response;
    }
}
