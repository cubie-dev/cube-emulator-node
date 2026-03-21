import { Bootstrapper } from '../bootstrap/Bootstrapper.js';
import { CONFIG_REPOSITORY_TOKEN, IRepository } from '../../api/core/config/Repository.js';
import { Repository } from './Repository.js';
import { ILogger, LOGGER_TOKEN } from '../../api/core/logger/Logger.js';
import { LogLevel } from '../logging/LogLevel.js';

export class ConfigBootstrapper extends Bootstrapper {
    public async registerBindings(): Promise<void> {
        this.emulator.rootContainer
            .bind<IRepository>(CONFIG_REPOSITORY_TOKEN)
            .to(Repository)
            .inSingletonScope();
    }

    public async boot(): Promise<void> {
        await this.emulator.rootContainer
            .get<IRepository>(CONFIG_REPOSITORY_TOKEN)
            .loadConfig();

        this.emulator.rootContainer.get<ILogger>(LOGGER_TOKEN)
            .log('Config', LogLevel.INFO, 'Configuration loaded!');
    }
}
