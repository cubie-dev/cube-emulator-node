import { Bootstrapper } from '../bootstrap/Bootstrapper.js';
import { LOGGER_TOKEN } from '../../api/core/logger/Logger.js';
import { WinstonLogger } from './WinstonLogger.js';

export class LoggingBootstrapper extends Bootstrapper {
    public async registerBindings(): Promise<void> {
        this.emulator.rootContainer
            .bind(LOGGER_TOKEN)
            .to(WinstonLogger)
            .inSingletonScope();
    }
}
