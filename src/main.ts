import { Emulator } from './core/Emulator';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const thisFileName = fileURLToPath(import.meta.url);
const dir = dirname(thisFileName);

const emulator = await Emulator.create(dir);

process.on('exit', () => {
    emulator.stop().catch(console.error);
})

emulator.start().catch(console.error);
