import { Client } from '../../../core/communication/Client';

export interface IGameServer {
    start(): void;
    stop(): void;
    disposeClient(client: Client): void;
}

export const GAME_SERVER_TOKEN = Symbol.for('IGameServer');
