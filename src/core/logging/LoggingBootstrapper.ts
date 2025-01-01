import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { LOGGER_TOKEN } from '../../api/core/logger/Logger';
import { WinstonLogger } from './WinstonLogger';

export class LoggingBootstrapper extends Bootstrapper {
    public async registerBindings(): Promise<void> {
        this.emulator.rootContainer
            .bind(LOGGER_TOKEN)
            .to(WinstonLogger)
            .inSingletonScope();
    }
}
