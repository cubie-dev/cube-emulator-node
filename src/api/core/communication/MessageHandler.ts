import { Client } from '../../../core/communication/Client.js';

export interface ISocketMessageHandler {
    handle(client: Client, data: Buffer): void;
}

export const SOCKET_MESSAGE_HANDLER_TOKEN = Symbol.for('ISocketMessageHandler');