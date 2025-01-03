import { ISocketMessageHandler } from '../../../api/core/communication/MessageHandler';
import { Client } from '../Client';
import { inject, injectable } from 'inversify';
import { EventContextFactory } from './events/EventContextFactory';
import {
    EVENT_HANDLER_REGISTRY_TOKEN,
    IEventHandlerRegistry
} from '../../../api/core/communication/IncomingMessageHandlerRegistry';
import { EMULATOR_TOKEN, IEmulator } from '../../../api/core/Emulator';
import { ILogger, LOGGER_TOKEN } from '../../../api/core/logger/Logger';
import { Response } from './responses/Response';
import { EventContext } from './events/EventContext';
import { CODEC_TOKEN, ICodec } from '../../../api/core/communication/Codec';
import { LogLevel } from '../../logging/LogLevel';
import { EVENT_CONTEXT_FACTORY_TOKEN } from '../../../api/core/communication/EventContextFactory';
import { CONFIG_REPOSITORY_TOKEN, IRepository } from '../../../api/core/config/Repository';
import { Pipeline } from '../../support/pipeline/Pipeline';
import { Event } from './events/Event';
import * as console from 'node:console';
import { Class } from 'utility-types';
import { EventHandler } from './events/EventHandler';
import { EventLoggerPipe } from '../pipes/EventLoggerPipe';

@injectable()
export class SocketMessageHandler implements ISocketMessageHandler {
    public constructor(
        @inject(EVENT_HANDLER_REGISTRY_TOKEN) private handlerRegistry: IEventHandlerRegistry,
        @inject(EMULATOR_TOKEN) private emulator: IEmulator,
        @inject(LOGGER_TOKEN) private logger: ILogger,
        @inject(CODEC_TOKEN) private codec: ICodec,
        @inject(EVENT_CONTEXT_FACTORY_TOKEN) private eventContextFactory: EventContextFactory,
        @inject(CONFIG_REPOSITORY_TOKEN) private configRepository: IRepository,
    ) {
    }

    private async dispatchHandler(
        event: Event,
        eventContext: EventContext,
        handler: Class<EventHandler>
    ): Promise<Response | Response[]> {
        return this.emulator.rootContainer
            .resolve(handler)
            .handle(
                event,
                eventContext,
            );
    }

    public async handle(client: Client, data: Buffer): Promise<void> {
        const event = this.codec.decode(data);
        const pipeline = new Pipeline<Event, Response>(
            this.emulator.rootContainer
        );
        const eventContext = this.eventContextFactory.makeForClient(client);

        try {
            const response = await pipeline
                .send(event)
                .through([
                    EventLoggerPipe,
                ])
                .then( (event: Event) => {
                    const handler = this.handlerRegistry.getByHeader(event.header);

                    if (!handler) {
                        throw new Error(`No handler found for header: ${event.header}`);
                    }

                    return this.dispatchHandler(event, eventContext, handler);
                });

            if (! response) {
                return;
            }

            void this.flushAndRespond(eventContext, response);
        } catch (e: unknown) {
            this.logger.log('Network', LogLevel.ERROR, `Error while handling: ${event.header}; ${e}`);
        }
    }

    private async flushAndRespond(context: EventContext, response: Response | Response[]): Promise<void> {
        await context.flush();

        const responses = Array.isArray(response) ? response : [response];

        for (const response of responses) {
            const arrayBuffer = this.codec.encode(response);

            context.client.send(arrayBuffer, (err: Error): void => {
                if (!err) {
                    return;
                }

                this.logger.log('Network', LogLevel.ERROR, `Error while sending response: ${err}`);
            });
        }
    }
}
