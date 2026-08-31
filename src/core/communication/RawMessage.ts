import type { Client } from './Client';
import type { Event } from './events/Event';

export type RawMessage = {
    readonly client: Client;
    readonly data: Buffer;
};

export type DecodedMessage = {
    readonly client: Client;
    readonly event: Event;
};
