import { injectable } from 'inversify';
import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { CONFIG_REPOSITORY_TOKEN, IRepository } from '../../api/core/config/Repository';
import { Repository } from './Repository';

@injectable()
export class ConfigBootstrapper extends Bootstrapper {
    public async onEmulatorBootstrapping(): Promise<void> {
        this.registerBindings();

        await this.emulator.container
            .get<IRepository>(CONFIG_REPOSITORY_TOKEN)
            .loadConfig();
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
