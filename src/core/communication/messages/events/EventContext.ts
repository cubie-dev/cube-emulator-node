import { EntityManager } from '@mikro-orm/core';
import { Client } from '../../Client';

export class EventContext {
    public constructor(
        public readonly client: Client,
        public readonly entityManager: EntityManager,
    ) {
    }

    public async flush(): Promise<void> {
        await this.entityManager.flush();
    }
}
