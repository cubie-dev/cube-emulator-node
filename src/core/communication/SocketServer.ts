import { inject, injectable } from 'inversify';
import { Server, WebSocketServer, WebSocket, RawData } from 'ws';
import { CONFIG_REPOSITORY_TOKEN, IRepository } from '../../api/core/config/Repository';
import { ISocketServer } from '../../api/core/communication/SocketServer';
import { ILogger, LOGGER_TOKEN } from '../../api/core/logger/Logger';
import { Client } from './Client';
import { ISocketMessageHandler, SOCKET_MESSAGE_HANDLER_TOKEN } from '../../api/core/communication/MessageHandler';

@injectable()
export class SocketServer implements ISocketServer {
    private _server?: Server;
    private _clients: Client[] = [];

    public constructor(
        @inject(CONFIG_REPOSITORY_TOKEN) private config: IRepository,
        @inject(LOGGER_TOKEN) private logger: ILogger,
        @inject(SOCKET_MESSAGE_HANDLER_TOKEN) private messageHandler: ISocketMessageHandler,
    ) {
    }

    public start(): void {
        if (!this._server) {
            this.createServer();
        }

        this._server.on('listening', this.onStartedListening.bind(this));
        this._server.on('connection', this.onNewConnection.bind(this))
    }

    public stop(): void {
        this.logger.log('Server', 'info', 'Server stopping...');
    }

    private createServer(): void {
        this._server = new WebSocketServer({
            port: this.config.get<number>('network.port', 3333),
            host: this.config.get<string>('network.host', '0.0.0.0'),
            verifyClient: (info, cb) => {
                console.log(info.origin);
                // TODO verify client
                cb(true);
            },
        })
    }

    private onStartedListening() {
        this.logger.log(
            'Server',
            'info',
            `Server started listening on ${this.config.get<string>('network.host', '0.0.0.0')}:${this.config.get<number>('network.port', 3333)}`
        );
    }

    private onNewConnection(socket: WebSocket) {
        const client = new Client(socket);

        this._clients.push(client);

        client.onMessage((client: Client, data: RawData) => {
            this.messageHandler.handle(client, data);
        });
    }
}
