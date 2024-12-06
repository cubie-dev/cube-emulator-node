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
    private _bootstrappedBootstrappers: Bootstrapper[] = [];

    public constructor(
        private emulator: IEmulator
    ) {
    }

    public async bootstrap(): Promise<EmulatorBootstrapper> {
        await this.bootstrapBootstrappers();
        this.emulator.events.emit('bootstrapped');

        return this;
    }

    private async bootstrapBootstrappers(): Promise<void> {
        this._bootstrappedBootstrappers = await Promise.all<Bootstrapper>(
            this._bootstrappers.map(async (bootstrapper) => {
                const instance = new bootstrapper(this.emulator);

                await instance.onEmulatorBootstrapping?.();

                return instance;
            }));
    }

    private async runBootstrappersOnEmulatorStart(): Promise<void> {
        await Promise.all(
            this._bootstrappedBootstrappers.map(async (bootstrapper) => {
                await bootstrapper.onEmulatorStart?.();
            }));
    }

    private async runBootstrappersOnEmulatorStop(): Promise<void> {
        await Promise.all(
            this._bootstrappedBootstrappers.map(async (bootstrapper) => {
                await bootstrapper.onEmulatorStop?.();
            }));
    }

    public async start(): Promise<void> {
        await this.runBootstrappersOnEmulatorStart();
        this.emulator.container
            .get<ISocketServer>(SOCKET_SERVER_TOKEN)
            .start();

        this.emulator.events.emit('started');
    }

    public async stop(): Promise<void> {
        this.runBootstrappersOnEmulatorStop();
        this.emulator.events.emit('stopped');
    }
}
