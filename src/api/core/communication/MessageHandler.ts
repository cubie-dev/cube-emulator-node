import { Client } from '../../../core/communication/Client';

export interface ISocketMessageHandler {
    handle(client: Client, data: Buffer): Promise<void>;
}

export const SOCKET_MESSAGE_HANDLER_TOKEN = Symbol.for('ISocketMessageHandler');
