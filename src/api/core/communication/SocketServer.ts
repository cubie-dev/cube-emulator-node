import { Client } from '../../../core/communication/Client';

export interface ISocketServer {
    start(): void;
    stop(): void;
    disposeClient(client: Client): void;
}

export const SOCKET_SERVER_TOKEN = Symbol.for('ISocketServer');
