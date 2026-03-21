import { inject } from 'inversify';
import { Server, ServerWebSocket } from 'bun';
import { CONFIG_REPOSITORY_TOKEN, type IRepository } from '../../api/core/config/Repository.js';
import type { ISocketServer } from '../../api/core/communication/SocketServer.js';
import { type ILogger, LOGGER_TOKEN } from '../../api/core/logger/Logger.js';
import { Client } from './Client.js';
import { type ISocketMessageHandler, SOCKET_MESSAGE_HANDLER_TOKEN } from '../../api/core/communication/MessageHandler.js';
import { LogLevel } from '../logging/LogLevel.js';

export class SocketServer implements ISocketServer {
    private server?: Server<Client>;
    private clients: Client[] = [];

    public constructor(
        @inject(CONFIG_REPOSITORY_TOKEN) private config: IRepository,
        @inject(LOGGER_TOKEN) private logger: ILogger,
        @inject(SOCKET_MESSAGE_HANDLER_TOKEN) private messageHandler: ISocketMessageHandler,
    ) {
    }

    public start(): void {
        const port = this.config.get<number>('network.port', 3333);
        const hostname = this.config.get<string>('network.host', '0.0.0.0');

        this.server = Bun.serve({
            port,
            hostname,
            fetch: (req: Request, server: Server<Client>) => {
                if (server.upgrade(req, { data: null })) {
                    return
                }

                return new Response('WebSocket upgrade required', { status: 426 });
            },
            websocket: {
                open: (ws: ServerWebSocket<Client>) => {
                    const client = new Client(ws);
                    ws.data = client;

                    this.clients.push(client);
                },
                message: (ws: ServerWebSocket<Client>, data: Buffer | string) => {
                    this.messageHandler.handle(ws.data, data instanceof Buffer ? data : Buffer.from(data));
                },
                close: (ws: ServerWebSocket<Client>) => {
                    this.clients = this.clients.filter(c => c !== ws.data);
                },
            },
        });

        this.logger.log('Server', LogLevel.INFO, `Server started listening on ${hostname}:${port}`);
    }

    public stop(): void {
        this.logger.log('Server', LogLevel.INFO, 'Stopping...');
        this.server?.stop();
    }

    public disposeClient(client: Client): void {
        const index = this.clients.indexOf(client);

        if (index === -1) {
            return;
        }

        this.clients.splice(index, 1);
        client.socket.close();
    }
}
