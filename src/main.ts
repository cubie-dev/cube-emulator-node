import { Emulator } from './core/Emulator';
import { hotState, reloadEventHandlers } from './core/bootstrap/HotReload';

const state = hotState();

if (state.emulator) {
    // `bun --hot` re-evaluated this graph while the emulator from the first boot kept
    // running, so the clients stay connected and only the handlers are swapped out.
    reloadEventHandlers(state.emulator);
} else {
    const bootstrapper = await Emulator.create(import.meta.dir);

    process.on("SIGINT", () => {
        process.exit();
    });

    process.on('exit', () => {
        bootstrapper.stop().catch(console.error);
    })

    try {
        await bootstrapper.start();

        state.emulator = bootstrapper.emulator;
    } catch (e: unknown) {
        console.error(e);
    }
}
