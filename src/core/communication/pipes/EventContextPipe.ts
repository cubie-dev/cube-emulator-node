import { inject, injectable } from 'inversify';
import { type PipeClass, type Destination } from '../../support/pipeline/Pipeline';
import { type DecodedMessage } from '../RawMessage';
import { EventContext } from '../events/EventContext';
import { type Response } from '../responses/Response';
import {
    EVENT_CONTEXT_FACTORY_TOKEN,
    type IEventContextFactory,
} from '../../../api/core/communication/EventContextFactory';

@injectable()
export class EventContextPipe implements PipeClass<DecodedMessage, EventContext, Response | Response[]> {
    public constructor(
        @inject(EVENT_CONTEXT_FACTORY_TOKEN) private readonly factory: IEventContextFactory,
    ) {}

    public handle(
        input: DecodedMessage,
        next: Destination<EventContext, Response | Response[]>,
    ): Promise<Response | Response[] | null> {
        return next(this.factory.create(input.client, input.event));
    }
}
