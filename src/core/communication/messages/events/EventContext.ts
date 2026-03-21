import { Client } from '../../Client';
import { Event } from './Event';
import { EntityManager } from '@mikro-orm/postgresql';

export class EventContext {
    public constructor(
        public readonly client: Client,
        public readonly event: Event,
        public readonly em: EntityManager,
    ) {
    }
}
