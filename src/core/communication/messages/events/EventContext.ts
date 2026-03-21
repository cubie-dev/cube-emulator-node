import { Client } from '../../Client.js';
import { Event } from './Event.js';
import { EntityManager } from '@mikro-orm/postgresql';

export class EventContext {
    public constructor(
        public readonly client: Client,
        public readonly event: Event,
        public readonly em: EntityManager,
    ) {
    }
}
