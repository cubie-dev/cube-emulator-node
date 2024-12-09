import { Event } from './Event';
import { Response } from '../responses/Response';
import { Client } from '../../Client';

export abstract class EventHandler {
    public abstract handle(clientRequest: Event, client: Client): Response|null;
}
