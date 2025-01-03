import { ConfigBootstrapper } from './config/ConfigBootstrapper';
import { IEmulator } from '../api/core/Emulator';
import { Bootstrapper } from './bootstrap/Bootstrapper';
import { ISocketServer, SOCKET_SERVER_TOKEN } from '../api/core/communication/SocketServer';
import { NetworkBootstrapper } from './communication/NetworkBootstrapper';
import { LoggingBootstrapper } from './logging/LoggingBootstrapper';
import { Class } from 'utility-types';
import { DatabaseBootstrapper } from './database/DatabaseBootstrapper';
import * as console from 'node:console';

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
        this.showBanner();

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

    private showBanner(): void {
        const logo = `
 ______     __  __     ______     __     ______    
/\\  ___\\   /\\ \\/\\ \\   /\\  == \\   /\\ \\   /\\  ___\\   
\\ \\ \\____  \\ \\ \\_\\ \\  \\ \\  __<   \\ \\ \\  \\ \\  __\\   
 \\ \\_____\\  \\ \\_____\\  \\ \\_____\\  \\ \\_\\  \\ \\_____\\ 
  \\/_____/   \\/_____/   \\/_____/   \\/_/   \\/_____/     
   Version ${this.emulator.version}                   
        `
        console.log(logo);
    }
}
