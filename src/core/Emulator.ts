import { Container } from 'inversify';
import { EmulatorBootstrapper } from './EmulatorBootstrapper';
import { EMULATOR_TOKEN, IEmulator } from '../api/core/Emulator';
import { EventEmitter } from 'node:events';
import { EventMap } from './events/EventMap';

export class Emulator implements IEmulator {
    private readonly _startTime: Date;
    private readonly _eventEmitter: EventEmitter;
    private readonly _container: Container;

    private constructor(
        private _rootDirectory: string
    ) {
        this._startTime = new Date();
        this._eventEmitter = new EventEmitter<EventMap>();
        this._container = new Container();

        this._container.bind(EMULATOR_TOKEN).toConstantValue(this)
    }

    public get container(): Container {
        return this._container;
    }

    public get rootDirectory(): string {
        return this._rootDirectory;
    }

    public get events(): EventEmitter {
        return this._eventEmitter;
    }

    public get startTime(): Date {
        return this._startTime;
    }

    public static async create(rootDirectory: string): Promise<EmulatorBootstrapper> {
        return new EmulatorBootstrapper(new this(rootDirectory)).bootstrap();
    }
}
