import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { type GameServer, GAME_SERVER_TOKEN } from '../../api/core/communication/GameServer.ts';
import { TcpServer } from './TcpServer.ts';
import { type ISocketMessageHandler, SOCKET_MESSAGE_HANDLER_TOKEN } from '../../api/core/communication/MessageHandler';
import { SocketMessageHandler } from './messages/SocketMessageHandler';
import { EventAndResponsesBootstrapper } from './EventAndResponsesBootstrapper';
import { Codec } from './Codec';
import { CODEC_TOKEN, type ICodec } from '../../api/core/communication/Codec';
import { type Class } from '../support/types/Class';

export class NetworkBootstrapper extends Bootstrapper {
    public override async registerBindings(): Promise<void> {

        this.emulator.rootContainer
            .bind<GameServer>(GAME_SERVER_TOKEN)
            .to(TcpServer)
            .inSingletonScope();

        this.emulator.rootContainer
            .bind<ISocketMessageHandler>(SOCKET_MESSAGE_HANDLER_TOKEN)
            .to(SocketMessageHandler);

        this.emulator.rootContainer
            .bind<ICodec>(CODEC_TOKEN)
            .to(Codec);
    }

    public override async stop(): Promise<void> {
        const socketServer = this.emulator.rootContainer
            .get<GameServer>(GAME_SERVER_TOKEN);

        socketServer.stop();
    }

    public override bootstraps(): Class<Bootstrapper>[] {
        return [
            EventAndResponsesBootstrapper
        ];
    }
}
