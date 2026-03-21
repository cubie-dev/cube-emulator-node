import type { IEmulator } from '../../api/core/Emulator.js';
import { Class } from 'utility-types';

export class Bootstrapper {
    public constructor(
        protected emulator: IEmulator,
    ) {
    }

    public async registerBindings(): Promise<void> {}
    public async boot(): Promise<void> {}
    public async stop(): Promise<void> {}
    public bootstraps(): Class<Bootstrapper>[] {
        return [];
    }
}
