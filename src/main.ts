import "reflect-metadata";
import { Emulator } from './core/Emulator';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

const thisFileName = fileURLToPath(import.meta.url);
const dirname = path.dirname(thisFileName);

const emulator = await Emulator.create(dirname);

process.on('exit', () => {
    emulator.stop().catch(console.error);
})

emulator.start().catch(console.error);
