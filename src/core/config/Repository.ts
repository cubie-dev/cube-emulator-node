import { type IRepository } from '../../api/core/config/Repository';
import { inject } from 'inversify';
import { readFile } from 'node:fs/promises';
import { EMULATOR_TOKEN, type IEmulator } from '../../api/core/Emulator';
import { join as joinPaths } from 'node:path';
import { get } from 'lodash-es';

export class Repository implements IRepository {
    private config?: any;

    public constructor(
        @inject(EMULATOR_TOKEN) private emulator: IEmulator
    ) {
    }

    public async loadConfig(): Promise<void> {
        const config = await readFile(
            joinPaths(this.emulator.rootDirectory, 'config.json'),
            'utf-8'
        );

        this.config = JSON.parse(config);
    }

    get<T>(key: string, defaultValue: T | null = null): T {
        return get(this.config, key, defaultValue);
    }
}
