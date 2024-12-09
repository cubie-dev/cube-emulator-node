export interface ISocketServer {
    start(): void;
    stop(): void;
}

export const SOCKET_SERVER_TOKEN = Symbol.for('ISocketServer');
