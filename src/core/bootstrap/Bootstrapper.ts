import { IEmulator } from '../../api/core/Emulator';
import { Class } from 'utility-types';

export class Bootstrapper {
    public constructor(
        protected emulator: IEmulator,
    ) {
    }

    public async onEmulatorBootstrapping(): Promise<void> {}
    public async onEmulatorStart(): Promise<void> {}
    public async onEmulatorStop(): Promise<void> {}
    public bootstraps(): Class<Bootstrapper>[] {
        return [];
    }
}
