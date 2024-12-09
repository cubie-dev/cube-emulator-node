import { EventHandler } from '../EventHandler';
import { Response } from '../../responses/Response';
import { Event } from '../Event';
import { Client } from '../../../Client';

export class ReleaseVersionEventHandler extends EventHandler {
    public handle(_clientRequest: Event, _client: Client): Response {
        return null;
    }
}
