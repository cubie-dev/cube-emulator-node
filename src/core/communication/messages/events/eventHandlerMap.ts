import { EventHandler } from './EventHandler';
import { EventHeader } from './EventHeader';
import { Class } from 'utility-types';
import { ReleaseVersionEventHandler } from './handlers/ReleaseVersionEventHandler';
import { PongEventHandler } from './handlers/PongEventHandler';
import { SsoEventHandler } from './handlers/handshake/SsoEventHandler';

const eventHandlerMap = new Map<number, Class<EventHandler>>();

eventHandlerMap.set(EventHeader.RELEASE_VERSION, ReleaseVersionEventHandler);
eventHandlerMap.set(EventHeader.CLIENT_PONG, PongEventHandler);
eventHandlerMap.set(EventHeader.SSO, SsoEventHandler);

export {
    eventHandlerMap
}
