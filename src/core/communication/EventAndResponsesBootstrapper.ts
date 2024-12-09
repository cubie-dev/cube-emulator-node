import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { IEventHandlersRegistry, EVENT_HANDLERS_REGISTRY_TOKEN } from '../../api/core/communication/IncomingMessageHandlerRegistry';
import { IncomingMessageHandlerRegistry } from './messages/IncomingMessageHandlerRegistry';
import { eventHandlersMap } from './messages/events/eventHandlersMap';

export class EventAndResponsesBootstrapper extends Bootstrapper {
    public async onEmulatorBootstrapping(): Promise<void> {
        this.registerBindings();
        this.loadMessages();
    }

    private registerBindings(): void {
        this.emulator.container
            .bind<IEventHandlersRegistry>(EVENT_HANDLERS_REGISTRY_TOKEN)
            .to(IncomingMessageHandlerRegistry)
            .inSingletonScope();
    }

    private loadMessages(): void {
        const repository = this.emulator.container.get<IEventHandlersRegistry>(EVENT_HANDLERS_REGISTRY_TOKEN);
        repository.overwriteHandlers(eventHandlersMap)
    }
}
