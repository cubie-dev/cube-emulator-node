import { EventHandler } from './EventHandler.js';
import { EventHeader } from './EventHeader.js';
import { Class } from 'utility-types';
import { ReleaseVersionEventHandler } from './handlers/ReleaseVersionEventHandler.js';
import { PongEventHandler } from './handlers/PongEventHandler.js';
import { SsoEventHandler } from './handlers/handshake/SsoEventHandler.js';
import { NavigationInitEvent } from './handlers/navigation/NavigationInitEvent.js';
import { NavigatorSearchEvent } from './handlers/navigation/NavigatorSearchEvent.js';

const eventHandlerMap = new Map<number, Class<EventHandler>>();

eventHandlerMap.set(EventHeader.RELEASE_VERSION, ReleaseVersionEventHandler);
eventHandlerMap.set(EventHeader.CLIENT_PONG, PongEventHandler);
eventHandlerMap.set(EventHeader.SSO, SsoEventHandler);

// navigation
eventHandlerMap.set(EventHeader.NAVIGATOR_SEARCH, NavigatorSearchEvent);
eventHandlerMap.set(EventHeader.NAVIGATOR_INIT, NavigationInitEvent);

export {
    eventHandlerMap
}
