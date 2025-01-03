import { EmulatorBootstrapper } from './EmulatorBootstrapper';
import { EMULATOR_TOKEN, IEmulator } from '../api/core/Emulator';
import { EventEmitter } from 'node:events';
import { Container } from 'inversify';
import { buildProviderModule } from 'inversify-binding-decorators';
import packageJson from '../../package.json';

export class Emulator implements IEmulator {
    public readonly startTime: Date;
    public readonly events: EventEmitter;
    public readonly rootContainer: Container;

    private constructor(
        public readonly rootDirectory: string
    ) {
        this.startTime = new Date();
        this.events = new EventEmitter();
        this.rootContainer = new Container();

        this.rootContainer.bind(EMULATOR_TOKEN).toConstantValue(this)
        this.rootContainer.load(buildProviderModule());
    }

    public static async create(rootDirectory: string): Promise<EmulatorBootstrapper> {
        return new EmulatorBootstrapper(new this(rootDirectory)).bootstrap();
    }

    public get version(): string {
        return packageJson.version;
    }
}
