import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { EventHandlerRegistry } from './messages/EventHandlerRegistry';
import { eventHandlerMap } from './messages/events/eventHandlerMap';
import { EVENT_HANDLER_REGISTRY_TOKEN, type IEventHandlerRegistry } from '../../api/core/communication/EventHandlerRegistry';

export class EventAndResponsesBootstrapper extends Bootstrapper {
    public override async registerBindings(): Promise<void> {
        this.emulator.rootContainer
            .bind<IEventHandlerRegistry>(EVENT_HANDLER_REGISTRY_TOKEN)
            .to(EventHandlerRegistry)
            .inSingletonScope();
    }

    public override async boot(): Promise<void> {
        this.loadMessages();
    }

    private loadMessages(): void {
        const repository = this.emulator.rootContainer.get<IEventHandlerRegistry>(EVENT_HANDLER_REGISTRY_TOKEN);
        repository.overwriteHandlers(eventHandlerMap)
    }
}
