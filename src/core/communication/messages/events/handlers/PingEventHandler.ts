import { EventHandler } from '../EventHandler';
import { Event } from '../Event';
import { PongResponse } from '../../responses/PongResponse';
import { Client } from '../../../Client';

export class PingEventHandler extends EventHandler {
    public handle(_clientRequest: Event, _client: Client): PongResponse {
        return new PongResponse();
    }
}
