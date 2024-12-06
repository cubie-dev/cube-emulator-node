import { Container } from 'inversify';
import { EventEmitter } from 'node:events';

export interface IEmulator {
    rootDirectory: string;
    startTime: Date;
    container: Container;
    events: EventEmitter;
}

export const EMULATOR_TOKEN = Symbol.for('IEmulator');
