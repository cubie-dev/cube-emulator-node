import { EventHandler } from './EventHandler';
import { EventHeader } from './EventHeader';
import { ReleaseVersionEventHandler } from './handlers/ReleaseVersionEventHandler';
import { PongEventHandler } from './handlers/PongEventHandler';
import { SsoEventHandler } from './handlers/handshake/SsoEventHandler';
import { InitDiffieHandshakeHandler } from './handlers/handshake/InitDiffieHandshakeHandler';
import { CompleteDiffieHandshakeHandler } from './handlers/handshake/CompleteDiffieHandshakeHandler';
import { NavigationInitHandler } from './handlers/navigation/NavigationInitHandler';
import { NavigatorSearchHandler } from './handlers/navigation/NavigatorSearchHandler';
import { RoomCreateHandler } from './handlers/navigation/RoomCreateHandler';
import { type Class } from '../../support/Class';

const eventHandlerMap = new Map<number, Class<EventHandler>>();

eventHandlerMap.set(EventHeader.RELEASE_VERSION, ReleaseVersionEventHandler);
eventHandlerMap.set(EventHeader.CLIENT_PONG, PongEventHandler);
eventHandlerMap.set(EventHeader.SECURITY_TICKET, SsoEventHandler);

// handshake
eventHandlerMap.set(EventHeader.HANDSHAKE_INIT_DIFFIE, InitDiffieHandshakeHandler);
eventHandlerMap.set(EventHeader.HANDSHAKE_COMPLETE_DIFFIE, CompleteDiffieHandshakeHandler);

// navigation
eventHandlerMap.set(EventHeader.NAVIGATOR_SEARCH, NavigatorSearchHandler);
eventHandlerMap.set(EventHeader.NAVIGATOR_INIT, NavigationInitHandler);
eventHandlerMap.set(EventHeader.ROOM_CREATE, RoomCreateHandler);

export {
    eventHandlerMap
}
