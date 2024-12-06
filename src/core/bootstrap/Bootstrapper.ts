import { IEmulator } from '../../api/core/Emulator';

export class Bootstrapper {
    public constructor(
        protected emulator: IEmulator,
    ) {
    }

    public async onEmulatorBootstrapping(): Promise<void> {}
    public async onEmulatorStart(): Promise<void> {}
    public async onEmulatorStop(): Promise<void> {}
}
