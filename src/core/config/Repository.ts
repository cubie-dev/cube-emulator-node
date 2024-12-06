import { IRepository } from '../../api/core/config/Repository';
import { inject, injectable } from 'inversify';
import * as fs from 'node:fs/promises';
import { EMULATOR_TOKEN, IEmulator } from '../../api/core/Emulator';
import * as path from 'node:path';
import { get } from 'lodash-es';

@injectable()
export class Repository implements IRepository {
    private _config?: any;

    public constructor(
        @inject(EMULATOR_TOKEN) private emulator: IEmulator
    ) {
    }

    public async loadConfig(): Promise<void> {
        const config = await fs.readFile(
            path.join(this.emulator.rootDirectory, 'config.json'),
            'utf-8'
        );

        this._config = JSON.parse(config);
    }

    get<T>(key: string, defaultValue: T|null = null): T {
        return get(this._config, key, defaultValue);
    }
}
