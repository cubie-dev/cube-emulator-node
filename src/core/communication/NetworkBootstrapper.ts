import { Bootstrapper } from '../bootstrap/Bootstrapper.js';
import { type ISocketServer, SOCKET_SERVER_TOKEN } from '../../api/core/communication/SocketServer.js';
import { SocketServer } from './SocketServer.js';
import { type ISocketMessageHandler, SOCKET_MESSAGE_HANDLER_TOKEN } from '../../api/core/communication/MessageHandler.js';
import { SocketMessageHandler } from './messages/SocketMessageHandler.js';
import { EventAndResponsesBootstrapper } from './EventAndResponsesBootstrapper.js';
import { Codec } from './Codec.js';
import { CODEC_TOKEN, type ICodec } from '../../api/core/communication/Codec.js';
import { Class } from '../support/types/Class';

export class NetworkBootstrapper extends Bootstrapper {
    public async registerBindings(): Promise<void> {

        this.emulator.rootContainer
            .bind<ISocketServer>(SOCKET_SERVER_TOKEN)
            .to(SocketServer)
            .inSingletonScope();

        this.emulator.rootContainer
            .bind<ISocketMessageHandler>(SOCKET_MESSAGE_HANDLER_TOKEN)
            .to(SocketMessageHandler);

        this.emulator.rootContainer
            .bind<ICodec>(CODEC_TOKEN)
            .to(Codec);
    }

    public async stop(): Promise<void> {
        const socketServer = this.emulator.rootContainer
            .get<ISocketServer>(SOCKET_SERVER_TOKEN);

        socketServer.stop();
    }

    public bootstraps(): Class<Bootstrapper>[] {
        return [
            EventAndResponsesBootstrapper
        ];
    }
}
