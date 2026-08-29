import {
    EVENT_HANDLER_REGISTRY_TOKEN,
    type IEventHandlerRegistry
} from '../../api/core/communication/EventHandlerRegistry';
import { type IEmulator } from '../../api/core/Emulator';
import { type ILogger, LOGGER_TOKEN } from '../../api/core/logger/Logger';
import { eventHandlerMap } from '../communication/messages/events/eventHandlerMap';
import { LogLevel } from '../logging/LogLevel';

/**
 * `bun --hot` re-evaluates the entire module graph inside the running process, so
 * every module — this one included — comes back with fresh class identities while
 * `globalThis` survives untouched. Parking the booted emulator there keeps the IoC
 * container, the database pool and the open WebSockets alive across a reload, so
 * connected clients never notice a code change.
 */
const HOT_STATE_KEY = Symbol.for('cube.hotState');

interface HotState {
    emulator?: IEmulator;
}

type Globals = typeof globalThis & {
    [HOT_STATE_KEY]?: HotState
};

export const hotState = (): HotState => {
    const globals = globalThis as Globals;

    return globals[HOT_STATE_KEY] ??= {};
}

/**
 * Swaps the freshly evaluated handlers into the registry that survived the reload.
 * Anything a handler reaches — responses, entities — is fresh along with it, since
 * the whole graph was rebuilt around the singletons we deliberately kept.
 */
export const reloadEventHandlers = (emulator: IEmulator): void => {
    emulator.rootContainer
        .get<IEventHandlerRegistry>(EVENT_HANDLER_REGISTRY_TOKEN)
        .overwriteHandlers(eventHandlerMap);

    emulator.rootContainer
        .get<ILogger>(LOGGER_TOKEN)
        .log('Hot', LogLevel.INFO, `Reloaded ${eventHandlerMap.size} event handlers`);
}
