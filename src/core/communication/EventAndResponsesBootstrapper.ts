import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { IEventHandlerRegistry, EVENT_HANDLER_REGISTRY_TOKEN } from '../../api/core/communication/IncomingMessageHandlerRegistry';
import { EventHandlerRegistry } from './messages/EventHandlerRegistry';
import { eventHandlerMap } from './messages/events/eventHandlerMap';

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
