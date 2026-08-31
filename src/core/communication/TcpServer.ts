import { inject } from 'inversify';
import { type Socket, type TCPSocketListener } from 'bun';
import { CONFIG_REPOSITORY_TOKEN, type IRepository } from '../../api/core/config/Repository';
import { type GameServer } from '../../api/core/communication/GameServer';
import { type ILogger, LOGGER_TOKEN } from '../../api/core/logger/Logger';
import { Client } from './Client';
import { type ISocketMessageHandler, SOCKET_MESSAGE_HANDLER_TOKEN } from '../../api/core/communication/MessageHandler';
import { LogLevel } from '../logging/LogLevel';

export class TcpServer implements GameServer {
    private server?: TCPSocketListener<Client>;
    private clients: Client[] = [];

    public constructor(
        @inject(CONFIG_REPOSITORY_TOKEN) private config: IRepository,
        @inject(LOGGER_TOKEN) private logger: ILogger,
        @inject(SOCKET_MESSAGE_HANDLER_TOKEN) private messageHandler: ISocketMessageHandler,
    ) {
    }

    public start(): void {
        const port = this.config.get<number>('server.port', 3333);
        const hostname = this.config.get<string>('server.host', '0.0.0.0');

        this.server = Bun.listen<Client>({
            hostname,
            port,
            socket: {
                open: (socket: Socket<Client>) => {
                    const client = new Client(socket);
                    socket.data = client;
                    this.clients.push(client);
                },
                data: (socket: Socket<Client>, data: Buffer) => {
                    const messages = socket.data.appendData(data);

                    for (const message of messages) {
                        void this.messageHandler.handle(socket.data, message);
                    }
                },
                close: (socket: Socket<Client>) => {
                    this.clients = this.clients.filter(c => c !== socket.data);
                },
                error: (socket: Socket<Client>, error: Error) => {
                    this.logger.log('Server', LogLevel.ERROR, `Socket error: ${error.message}`);
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
        client.socket.end();
    }
}
