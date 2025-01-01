import { ConfigBootstrapper } from './config/ConfigBootstrapper';
import { IEmulator } from '../api/core/Emulator';
import { Bootstrapper } from './bootstrap/Bootstrapper';
import { ISocketServer, SOCKET_SERVER_TOKEN } from '../api/core/communication/SocketServer';
import { NetworkBootstrapper } from './communication/NetworkBootstrapper';
import { LoggingBootstrapper } from './logging/LoggingBootstrapper';
import { Class } from 'utility-types';
import { DatabaseBootstrapper } from './database/DatabaseBootstrapper';
import * as console from 'node:console';
import { Codec } from './communication/Codec';

export class EmulatorBootstrapper {
    /**
     * Bootstrappers that will be run on initial emulator start up
     */
    private bootstrappers: Class<Bootstrapper>[] = [
        LoggingBootstrapper,
        ConfigBootstrapper,
        NetworkBootstrapper,
        DatabaseBootstrapper,
    ];
    /**
     * Bootstrappers that have been bootstrapped
     */
    private bootstrappedBootstrappers: Bootstrapper[] = [];

    public constructor(
        private emulator: IEmulator
    ) {
    }

    public async bootstrap(): Promise<EmulatorBootstrapper> {
        await this.registerBootstrappers(this.bootstrappers);

        return this;
    }

    private async registerBootstrappers(bootstrappersToBootstrap: Class<Bootstrapper>[]): Promise<void> {
        for (const bootstrapper of bootstrappersToBootstrap) {
            const alreadyBootstrapped = this.bootstrappedBootstrappers.some((b) => b instanceof bootstrapper);

            if (alreadyBootstrapped) {
                continue;
            }

            const instance = new bootstrapper(this.emulator);

            await instance.registerBindings?.();

            this.bootstrappedBootstrappers.push(instance);

            if (instance.bootstraps()) {
                await this.registerBootstrappers(instance.bootstraps());
            }
        }
    }

    private async bootBootstrappers(): Promise<void> {
        for (const bootstrapper of this.bootstrappedBootstrappers) {
            await bootstrapper.boot?.();
        }
    }

    private async stopBootstrappers(): Promise<void> {
        for (const bootstrapper of this.bootstrappedBootstrappers) {
            await bootstrapper.stop?.();
        }
    }

    public async start(): Promise<void> {
        await this.bootBootstrappers();
        this.emulator.rootContainer
            .get<ISocketServer>(SOCKET_SERVER_TOKEN)
            .start();

        this.emulator.events.emit('started');
    }

    public async stop(): Promise<void> {
        void this.stopBootstrappers();
        this.emulator.events.emit('stopped');
    }
}
