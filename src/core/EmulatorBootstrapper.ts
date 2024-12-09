import { interfaces } from 'inversify';
import { ConfigBootstrapper } from './config/ConfigBootstrapper';
import { IEmulator } from '../api/core/Emulator';
import { Bootstrapper } from './bootstrap/Bootstrapper';
import { ISocketServer, SOCKET_SERVER_TOKEN } from '../api/core/communication/SocketServer';
import { NetworkBootstrapper } from './communication/NetworkBootstrapper';
import { LoggingBootstrapper } from './logging/LoggingBootstrapper';
import { Class } from 'utility-types';

export class EmulatorBootstrapper {
    /**
     * Bootstrappers that will be run on initial emulator start up
     */
    private _bootstrappers: Class<Bootstrapper>[] = [
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
        await this.bootstrapBootstrappers(this._bootstrappers);
        this.emulator.events.emit('bootstrapped');

        return this;
    }

    private async bootstrapBootstrappers(bootstrappersToBootstrap: Class<Bootstrapper>[]): Promise<void> {
        for (const bootstrapper of bootstrappersToBootstrap) {
            // check if in _bootstrappedBootstrappers
            if (this._bootstrappedBootstrappers.some((b) => b instanceof bootstrapper)) {
                continue;
            }

            const instance = new bootstrapper(this.emulator);

            await instance.onEmulatorBootstrapping?.();

            this._bootstrappedBootstrappers.push(instance);

            if (instance.bootstraps()) {
                await this.bootstrapBootstrappers(instance.bootstraps());
            }
        }
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
        void this.runBootstrappersOnEmulatorStop();
        this.emulator.events.emit('stopped');
    }
}
