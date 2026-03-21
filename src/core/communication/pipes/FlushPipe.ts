import { Destination, PipeClass } from '../../support/pipeline/Pipeline.js';
import { Response } from '../messages/responses/Response.js';
import { EventContext } from '../messages/events/EventContext.js';

/**
 * Responsible for flushing all changes before sending the response back to the client.
 */
export class FlushPipe implements PipeClass<EventContext, Response> {
    public async handle(event: EventContext, next: Destination<EventContext, Response>): Promise<Response[] | Response | null> {
        const response = await next(event);

        await event.em.flush();

        return response;
    }
}
