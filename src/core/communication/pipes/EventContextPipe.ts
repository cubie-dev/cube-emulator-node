import { inject, injectable } from 'inversify';
import { type PipeClass, type Destination } from '../../support/pipeline/Pipeline';
import { type DecodedMessage } from '../RawMessage';
import { EventContext } from '../events/EventContext';
import { type Composer } from '../composers/Composer.ts';
import {
    EVENT_CONTEXT_FACTORY_TOKEN,
    type IEventContextFactory,
} from '../../../api/core/communication/EventContextFactory';

@injectable()
export class EventContextPipe implements PipeClass<DecodedMessage, EventContext, Composer | Composer[]> {
    public constructor(
        @inject(EVENT_CONTEXT_FACTORY_TOKEN) private readonly factory: IEventContextFactory,
    ) {}

    public handle(
        input: DecodedMessage,
        next: Destination<EventContext, Composer | Composer[]>,
    ): Promise<Composer | Composer[] | null> {
        return next(this.factory.create(input.client, input.event));
    }
}
