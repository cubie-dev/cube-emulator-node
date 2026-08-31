import { EventHandler } from './EventHandler';
import { EventHeader } from './EventHeader';
import { ReleaseVersionEventHandler } from './handlers/ReleaseVersionEventHandler';
import { PongEventHandler } from './handlers/PongEventHandler';
import { SsoEventHandler } from './handlers/handshake/SsoEventHandler';
import { InitDiffieHandshakeEvent } from './handlers/handshake/InitDiffieHandshakeEvent';
import { CompleteDiffieHandshakeEvent } from './handlers/handshake/CompleteDiffieHandshakeEvent';
import { NavigationInitEvent } from './handlers/navigation/NavigationInitEvent';
import { NavigatorSearchEvent } from './handlers/navigation/NavigatorSearchEvent';
import { RoomCreateEvent } from './handlers/navigation/RoomCreateEvent';
import { type Class } from '../../support/Class';

const eventHandlerMap = new Map<number, Class<EventHandler>>();

eventHandlerMap.set(EventHeader.RELEASE_VERSION, ReleaseVersionEventHandler);
eventHandlerMap.set(EventHeader.CLIENT_PONG, PongEventHandler);
eventHandlerMap.set(EventHeader.SECURITY_TICKET, SsoEventHandler);

// handshake
eventHandlerMap.set(EventHeader.HANDSHAKE_INIT_DIFFIE, InitDiffieHandshakeEvent);
eventHandlerMap.set(EventHeader.HANDSHAKE_COMPLETE_DIFFIE, CompleteDiffieHandshakeEvent);

// navigation
eventHandlerMap.set(EventHeader.NAVIGATOR_SEARCH, NavigatorSearchEvent);
eventHandlerMap.set(EventHeader.NAVIGATOR_INIT, NavigationInitEvent);
eventHandlerMap.set(EventHeader.ROOM_CREATE, RoomCreateEvent);

export {
    eventHandlerMap
}
