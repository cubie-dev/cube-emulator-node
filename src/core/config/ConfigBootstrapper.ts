import { injectable } from 'inversify';
import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { CONFIG_REPOSITORY_TOKEN, IRepository } from '../../api/core/config/Repository';
import { Repository } from './Repository';
import { ILogger, LOGGER_TOKEN } from '../../api/core/logger/Logger';
import { LogLevel } from '../logging/LogLevel';

@injectable()
export class ConfigBootstrapper extends Bootstrapper {
    public async onEmulatorBootstrapping(): Promise<void> {
        this.registerBindings();

        this.emulator.container.get<ILogger>(LOGGER_TOKEN)
            .log('Config', LogLevel.INFO, 'Bootstrapping...');

        await this.emulator.container
            .get<IRepository>(CONFIG_REPOSITORY_TOKEN)
            .loadConfig();

        this.emulator.container.get<ILogger>(LOGGER_TOKEN)
            .log('Config', LogLevel.INFO, 'Configuration loaded!');
        // load configuration
        // populate repository
    }

    private registerBindings(): void {
        this.emulator.container
            .bind<IRepository>(CONFIG_REPOSITORY_TOKEN)
            .to(Repository)
            .inSingletonScope();
    }
}
