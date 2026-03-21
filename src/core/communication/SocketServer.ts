import { inject } from 'inversify';
import { RawData, Server, WebSocket, WebSocketServer } from 'ws';
import { CONFIG_REPOSITORY_TOKEN, IRepository } from '../../api/core/config/Repository.js';
import { ISocketServer } from '../../api/core/communication/SocketServer.js';
import { ILogger, LOGGER_TOKEN } from '../../api/core/logger/Logger.js';
import { Client } from './Client.js';
import { ISocketMessageHandler, SOCKET_MESSAGE_HANDLER_TOKEN } from '../../api/core/communication/MessageHandler.js';
import { LogLevel } from '../logging/LogLevel.js';

export class SocketServer implements ISocketServer {
    private server?: Server;
    private clients: Client[] = [];

    public constructor(
        @inject(CONFIG_REPOSITORY_TOKEN) private config: IRepository,
        @inject(LOGGER_TOKEN) private logger: ILogger,
        @inject(SOCKET_MESSAGE_HANDLER_TOKEN) private messageHandler: ISocketMessageHandler,
    ) {
    }

    public start(): void {
        if (!this.server) {
            this.createServer();
        }

        this.server.on('listening', this.onStartedListening.bind(this));
        this.server.on('connection', this.onNewConnection.bind(this));
        this.server.on('upgrade', (request, socket, head) => {
            console.log(request, socket, head);
        })
    }

    public stop(): void {
        this.logger.log('Server', LogLevel.INFO, 'Stopping...');
    }

    private createServer(): void {
        this.server = new WebSocketServer({
            port: this.config.get<number>('network.port', 3333),
            host: this.config.get<string>('network.host', '0.0.0.0'),
            verifyClient: (info, cb) => {
                // TODO verify client
                cb(true);
            },
        })
    }

    private onStartedListening() {
        this.logger.log(
            'Server',
            LogLevel.INFO,
            `Server started listening on ${this.server.options.host}:${this.server.options.port}`
        );
    }

    private onNewConnection(socket: WebSocket) {
        const client = new Client(socket);

        this.clients.push(client);

        client.onMessage((client: Client, data: RawData) => {
            this.messageHandler.handle(client, data);
        });
    }

    public disposeClient(client: Client) {
        // TODO generate ID?
        const foundClient = this.clients.find((c: Client) => c === client);

        if (!foundClient) {
            return;
        }

        foundClient.socket.close();

        process.nextTick(() => {
            if (
                foundClient.socket.readyState === WebSocket.OPEN
                || foundClient.socket.readyState === WebSocket.CLOSING
            ) {
                foundClient.socket.terminate();
            }
        });
    }
}
