import { ISocketMessageHandler } from '../../../api/core/communication/MessageHandler';
import { Client } from '../Client';
import { inject, injectable } from 'inversify';
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
import { CONFIG_REPOSITORY_TOKEN, IRepository } from '../../../api/core/config/Repository';
import { Pipeline } from '../../support/pipeline/Pipeline';
import { Class } from 'utility-types';
import { EventHandler } from './events/EventHandler';
import { EventLoggerPipe } from '../pipes/EventLoggerPipe';
import { FlushPipe } from '../pipes/FlushPipe';

export class SocketMessageHandler implements ISocketMessageHandler {
    public constructor(
        @inject(EVENT_HANDLER_REGISTRY_TOKEN) private handlerRegistry: IEventHandlerRegistry,
        @inject(EMULATOR_TOKEN) private emulator: IEmulator,
        @inject(LOGGER_TOKEN) private logger: ILogger,
        @inject(CODEC_TOKEN) private codec: ICodec,
        @inject(CONFIG_REPOSITORY_TOKEN) private configRepository: IRepository,
    ) {
    }

    private async dispatchHandler(
        eventContext: EventContext,
        handler: Class<EventHandler>
    ): Promise<Response | Response[] | null> {
        return this.emulator.rootContainer
            .get(handler)
            .handle(
                eventContext,
            );
    }

    public async handle(client: Client, data: Buffer): Promise<void> {
        const event = this.codec.decode(data);
        const pipeline = new Pipeline<EventContext, Response>(
            this.emulator.rootContainer
        );
        const eventContext = new EventContext(client, event);

        try {
            const response = await pipeline
                .send(eventContext)
                .through([
                    EventLoggerPipe,
                    FlushPipe,
                ])
                .then( (ec: EventContext) => {
                    const handler = this.handlerRegistry.getByHeader(ec.event.header);

                    if (!handler) {
                        throw new Error(`No handler found for header: ${event.header}`);
                    }

                    return this.dispatchHandler(ec, handler);
                });

            if (! response) {
                return;
            }

            void this.flushAndRespond(eventContext, response);
        } catch (e: unknown) {
            this.logger.log('Network', LogLevel.ERROR, `Error while handling: ${event.header}`);
            console.error(e);
        }
    }

    private async flushAndRespond(context: EventContext, response: Response | Response[]): Promise<void> {
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
