import { IBootstrapper } from '../IBootstrapper';
import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { ISocketServer, SOCKET_SERVER_TOKEN } from '../../api/core/network/SocketServer';
import { SocketServer } from './SocketServer';

export class NetworkBootstrapper extends Bootstrapper {
    public async onEmulatorBootstrapping(): Promise<void> {
        this.registerBindings();
    }

    private registerBindings(): void {
        this.emulator.container
            .bind<ISocketServer>(SOCKET_SERVER_TOKEN)
            .to(SocketServer)
            .inSingletonScope();
    }
}
