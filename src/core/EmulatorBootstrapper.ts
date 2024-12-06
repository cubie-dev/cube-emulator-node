import { interfaces } from 'inversify';
import { ConfigBootstrapper } from './config/ConfigBootstrapper';
import { IEmulator } from '../api/core/Emulator';
import { Bootstrapper } from './bootstrap/Bootstrapper';
import { ISocketServer, SOCKET_SERVER_TOKEN } from '../api/core/network/SocketServer';
import { NetworkBootstrapper } from './network/NetworkBootstrapper';
import { LoggingBootstrapper } from './logging/LoggingBootstrapper';

export class EmulatorBootstrapper {
    /**
     * Bootstrappers that will be run on initial emulator start up
     */
    private _bootstrappers: interfaces.Newable<Bootstrapper>[] = [
        LoggingBootstrapper,
        ConfigBootstrapper,
        NetworkBootstrapper
    ];
    /**
     * Bootstrappers that have been bootstrapped
     */
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
            this._bootstrappers.map(async (bootstrapper): Promise<Bootstrapper> => {
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
