import { interfaces } from 'inversify';
import { ConfigBootstrapper } from './config/ConfigBootstrapper';
import { IEmulator } from '../api/core/Emulator';
import { Bootstrapper } from './bootstrap/Bootstrapper';
import { ISocketServer, SOCKET_SERVER_TOKEN } from '../api/core/network/SocketServer';
import { NetworkBootstrapper } from './network/NetworkBootstrapper';

export class EmulatorBootstrapper {
    private _bootstrappers: interfaces.Newable<Bootstrapper>[] = [
        ConfigBootstrapper,
        NetworkBootstrapper
    ];

    public constructor(
        private emulator: IEmulator
    ) {
    }

    public async bootstrap(): Promise<EmulatorBootstrapper> {
        await Promise.all<Bootstrapper>(this._bootstrappers.map(async (bootstrapper) => {
            const instance = new bootstrapper(this.emulator);

            await instance.onEmulatorBootstrapping?.();

            return instance;
        }));

        this.emulator.events.emit('bootstrapped');

        return this;
    }

    private bootstrapBootstrappers()

    public async start(): Promise<void> {
        this.emulator.container
            .get<ISocketServer>(SOCKET_SERVER_TOKEN)
            .start();

        this.emulator.events.emit('started');
    }

    public async stop(): Promise<void> {
        this.emulator.events.emit('stopped');
    }
}
