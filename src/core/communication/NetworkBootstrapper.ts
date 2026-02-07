import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { ISocketServer, SOCKET_SERVER_TOKEN } from '../../api/core/communication/SocketServer';
import { SocketServer } from './SocketServer';
import { ISocketMessageHandler, SOCKET_MESSAGE_HANDLER_TOKEN } from '../../api/core/communication/MessageHandler';
import { SocketMessageHandler } from './messages/SocketMessageHandler';
import { EventAndResponsesBootstrapper } from './EventAndResponsesBootstrapper';
import { Class } from 'utility-types';
import { Codec } from './Codec';
import { CODEC_TOKEN, ICodec } from '../../api/core/communication/Codec';

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
