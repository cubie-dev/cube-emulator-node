import { EventHandler } from './EventHandler';
import { EventHeader } from './EventHeader';
import { ReleaseVersionEventHandler } from './handlers/ReleaseVersionEventHandler';
import { PongEventHandler } from './handlers/PongEventHandler';
import { SsoEventHandler } from './handlers/handshake/SsoEventHandler';
import { NavigationInitEvent } from './handlers/navigation/NavigationInitEvent';
import { NavigatorSearchEvent } from './handlers/navigation/NavigatorSearchEvent';
import { type Class } from '../../../support/types/Class';

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
