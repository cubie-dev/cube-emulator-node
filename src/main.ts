import { Emulator } from './core/Emulator';

const emulator = await Emulator.create(import.meta.dir);

process.on("SIGINT", () => {
    process.exit();
});

process.on('exit', () => {
    emulator.stop().catch(console.error);
})

emulator.start().catch(console.error);
