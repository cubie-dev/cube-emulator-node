import { Destination, PipeClass } from '../../support/pipeline/Pipeline';
import { Response } from '../messages/responses/Response';
import { inject } from 'inversify';
import { DATABASE_MANAGER_TOKEN, IDatabaseManager } from '../../../api/core/database/DatabaseManager';
import { EventContext } from '../messages/events/EventContext';

/**
 * Responsible for flushing all changes before sending the response back to the client.
 */
export class FlushPipe implements PipeClass<EventContext, Response> {
    public constructor(
        @inject(DATABASE_MANAGER_TOKEN) private db: IDatabaseManager,
    ) {
    }

    public async handle(event: EventContext, next: Destination<EventContext, Response>): Promise<Response[] | Response | null> {
        const response = await next(event);

        console.log(this.db.em.getMetadata());

        await this.db.em.flush();

        return response;
    }
}
