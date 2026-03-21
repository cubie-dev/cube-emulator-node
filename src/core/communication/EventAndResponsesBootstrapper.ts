import { Bootstrapper } from '../bootstrap/Bootstrapper.js';
import { type IEventHandlerRegistry, EVENT_HANDLER_REGISTRY_TOKEN } from '../../api/core/communication/IncomingMessageHandlerRegistry.js';
import { EventHandlerRegistry } from './messages/EventHandlerRegistry.js';
import { eventHandlerMap } from './messages/events/eventHandlerMap.js';

export class EventAndResponsesBootstrapper extends Bootstrapper {
    public async registerBindings(): Promise<void> {
        this.emulator.rootContainer
            .bind<IEventHandlerRegistry>(EVENT_HANDLER_REGISTRY_TOKEN)
            .to(EventHandlerRegistry)
            .inSingletonScope();
    }

    async boot(): Promise<void> {
        this.loadMessages();
    }

    private loadMessages(): void {
        const repository = this.emulator.rootContainer.get<IEventHandlerRegistry>(EVENT_HANDLER_REGISTRY_TOKEN);
        repository.overwriteHandlers(eventHandlerMap)
    }
}
