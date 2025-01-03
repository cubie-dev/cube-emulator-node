import { Container } from 'inversify';
import { EventEmitter } from 'node:events';

export interface IEmulator {
    version: string;
    rootDirectory: string;
    startTime: Date;
    rootContainer: Container;
    events: EventEmitter;
}

export const EMULATOR_TOKEN = Symbol.for('IEmulator');
