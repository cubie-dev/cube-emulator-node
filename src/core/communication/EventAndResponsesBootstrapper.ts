import { Bootstrapper } from '../bootstrap/Bootstrapper';
import { EventHandlerRegistry } from './EventHandlerRegistry';
import { eventHandlerMap } from './events/eventHandlerMap';
import { EVENT_HANDLER_REGISTRY_TOKEN, type IEventHandlerRegistry } from '../../api/core/communication/EventHandlerRegistry';
import {
    EVENT_CONTEXT_FACTORY_TOKEN,
    type IEventContextFactory
} from '../../api/core/communication/EventContextFactory';
import { EventContextFactory } from './events/EventContextFactory';

export class EventAndResponsesBootstrapper extends Bootstrapper {
    public override async registerBindings(): Promise<void> {
        this.emulator.rootContainer
            .bind<IEventHandlerRegistry>(EVENT_HANDLER_REGISTRY_TOKEN)
            .to(EventHandlerRegistry)
            .inSingletonScope();
        this.emulator.rootContainer
            .bind<IEventContextFactory>(EVENT_CONTEXT_FACTORY_TOKEN)
            .to(EventContextFactory);
    }

    public override async boot(): Promise<void> {
        this.loadMessages();
    }

    private loadMessages(): void {
        const repository = this.emulator.rootContainer.get<IEventHandlerRegistry>(EVENT_HANDLER_REGISTRY_TOKEN);
        repository.overwriteHandlers(eventHandlerMap)
    }
}
