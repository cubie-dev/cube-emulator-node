import { EventHandler } from './EventHandler';
import { EventHeader } from './EventHeader';
import { Class } from 'utility-types';
import { ReleaseVersionEventHandler } from './handlers/ReleaseVersionEventHandler';
import { PingEventHandler } from './handlers/PingEventHandler';

const eventHandlerMap = new Map<number, Class<EventHandler>>();

eventHandlerMap.set(EventHeader.RELEASE_VERSION, ReleaseVersionEventHandler);
eventHandlerMap.set(EventHeader.CLIENT_PING, PingEventHandler);

export {
    eventHandlerMap
}
