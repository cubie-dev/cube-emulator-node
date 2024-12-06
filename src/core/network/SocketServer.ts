import { inject, injectable } from 'inversify';
import { createServer, Server, Socket } from 'node:net';
import { CONFIG_REPOSITORY_TOKEN, IRepository } from '../../api/core/config/Repository';
import { ISocketServer } from '../../api/core/network/SocketServer';

@injectable()
export class SocketServer implements ISocketServer {
    private _server?: Server;

    public constructor(
        @inject(CONFIG_REPOSITORY_TOKEN) private config: IRepository,
    ) {
    }

    public start(): void {
        if (!this._server) {
            this.createServer();
        }

        this._server.listen(
            this.config.get<number>('network.port', 3333),
            this.config.get<string>('network.host', '127.0.0.1'),
            () => this.onStartedListening()
        )
    }

    private createServer(): void {
        this._server = createServer(
            {},
            this.onClientConnected.bind(this)
        )
    }

    private onStartedListening() {
        console.log(`Started listening on port 3333`)
    }

    private onClientConnected(socket: Socket) {

        console.log(socket)
    }
}
