import { EventHandler } from './EventHandler';
import { EventHeader } from './EventHeader';
import { Class } from 'utility-types';
import { ReleaseVersionEventHandler } from './handlers/ReleaseVersionEventHandler';
import { PingEventHandler } from './handlers/PingEventHandler';

const eventHandlersMap = new Map<number, Class<EventHandler>>();

eventHandlersMap.set(EventHeader.RELEASE_VERSION, ReleaseVersionEventHandler);
eventHandlersMap.set(EventHeader.CLIENT_PING, PingEventHandler);

export {
    eventHandlersMap
}
