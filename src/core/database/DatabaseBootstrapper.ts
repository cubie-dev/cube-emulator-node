import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { ILogger, LOGGER_TOKEN } from '../../api/core/logger/Logger';
import { LogLevel } from '../logging/LogLevel';

export class DatabaseBootstrapper extends Bootstrapper {
    public async onEmulatorBootstrapping(): Promise<void> {
        this.registerBindings();

        this.emulator.container.get<ILogger>(LOGGER_TOKEN)
            .log('Database', LogLevel.INFO, 'Bootstrapping...');
    }

    private registerBindings(): void {

    }
}
