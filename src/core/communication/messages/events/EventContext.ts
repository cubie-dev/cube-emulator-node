import { Client } from '../../Client';
import { Event } from './Event';

export class EventContext {
    public constructor(
        public readonly client: Client,
        public readonly event: Event
    ) {
    }
}
