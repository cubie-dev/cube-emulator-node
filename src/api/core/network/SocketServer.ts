export interface ISocketServer {
    start(): void;
}

export const SOCKET_SERVER_TOKEN = Symbol.for('ISocketServer');
