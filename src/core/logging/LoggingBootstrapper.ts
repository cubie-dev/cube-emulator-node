import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { LOGGER_TOKEN } from '../../api/core/logger/Logger';
import { WinstonLogger } from './WinstonLogger';

export class LoggingBootstrapper extends Bootstrapper {
    public async onEmulatorBootstrapping(): Promise<void> {
        this.registerBindings();
    }

    private registerBindings(): void {
        this.emulator.container
            .bind(LOGGER_TOKEN)
            .to(WinstonLogger)
            .inSingletonScope();
    }
}
