import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { ISocketServer, SOCKET_SERVER_TOKEN } from '../../api/core/communication/SocketServer';
import { SocketServer } from './SocketServer';
import { ISocketMessageHandler, SOCKET_MESSAGE_HANDLER_TOKEN } from '../../api/core/communication/MessageHandler';
import { SocketMessageHandler } from './messages/SocketMessageHandler';
import { EventAndResponsesBootstrapper } from './EventAndResponsesBootstrapper';
import { Class } from 'utility-types';
import { Codec } from './Codec';

export class NetworkBootstrapper extends Bootstrapper {
    public async onEmulatorBootstrapping(): Promise<void> {
        this.registerBindings();
    }

    public async onEmulatorStop(): Promise<void> {
        const socketServer = this.emulator.container.get<ISocketServer>(SOCKET_SERVER_TOKEN);

        socketServer.stop();
    }

    private registerBindings(): void {
        this.emulator.container
            .bind<ISocketServer>(SOCKET_SERVER_TOKEN)
            .to(SocketServer)
            .inSingletonScope();

        this.emulator.container
            .bind<ISocketMessageHandler>(SOCKET_MESSAGE_HANDLER_TOKEN)
            .to(SocketMessageHandler);

        this.emulator.container
            .bind(Codec)
            .toSelf();
    }

    public bootstraps(): Class<Bootstrapper>[] {
        return [
            EventAndResponsesBootstrapper
        ];
    }
}
