import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { IEventHandlerRegistry, EVENT_HANDLER_REGISTRY_TOKEN } from '../../api/core/communication/IncomingMessageHandlerRegistry';
import { EventHandlerRegistry } from './messages/EventHandlerRegistry';
import { eventHandlerMap } from './messages/events/eventHandlerMap';

export class EventAndResponsesBootstrapper extends Bootstrapper {
    public async onEmulatorBootstrapping(): Promise<void> {
        this.registerBindings();
        this.loadMessages();
    }

    private registerBindings(): void {
        this.emulator.container
            .bind<IEventHandlerRegistry>(EVENT_HANDLER_REGISTRY_TOKEN)
            .to(EventHandlerRegistry)
            .inSingletonScope();
    }

    private loadMessages(): void {
        const repository = this.emulator.container.get<IEventHandlerRegistry>(EVENT_HANDLER_REGISTRY_TOKEN);
        repository.overwriteHandlers(eventHandlerMap)
    }
}
