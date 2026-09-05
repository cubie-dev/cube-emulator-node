import { injectable } from 'inversify';
import { type Destination, type PipeClass } from '../../support/pipeline/Pipeline';
import { type Composer } from '../composers/Composer.ts';
import { EventContext } from '../events/EventContext';

@injectable()
export class FlushPipe implements PipeClass<EventContext, EventContext, Composer | Composer[]> {
    public async handle(
        eventContext: EventContext,
        next: Destination<EventContext, Composer | Composer[]>,
    ): Promise<Composer | Composer[] | null> {
        const response = await next(eventContext);

        await eventContext.em.flush();

        return response;
    }
}
