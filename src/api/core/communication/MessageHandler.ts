import { Client } from '../../../core/communication/Client';
import { RawData } from 'ws';

export interface ISocketMessageHandler {
    handle(client: Client, data: RawData): void;
}

export const SOCKET_MESSAGE_HANDLER_TOKEN = Symbol.for('ISocketMessageHandler');
