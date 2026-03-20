import { ISocketMessageHandler } from '../../../api/core/communication/MessageHandler.js';
import { Client } from '../Client.js';
import { inject } from 'inversify';
import {
    EVENT_HANDLER_REGISTRY_TOKEN,
    IEventHandlerRegistry
} from '../../../api/core/communication/IncomingMessageHandlerRegistry.js';
import { EMULATOR_TOKEN, IEmulator } from '../../../api/core/Emulator.js';
import { ILogger, LOGGER_TOKEN } from '../../../api/core/logger/Logger.js';
import { Response } from './responses/Response.js';
import { EventContext } from './events/EventContext.js';
import { CODEC_TOKEN, ICodec } from '../../../api/core/communication/Codec.js';
import { LogLevel } from '../../logging/LogLevel.js';
import { CONFIG_REPOSITORY_TOKEN, IRepository } from '../../../api/core/config/Repository.js';
import { Pipeline } from '../../support/pipeline/Pipeline.js';
import { Class } from 'utility-types';
import { EventHandler } from './events/EventHandler.js';
import { EventLoggerPipe } from '../pipes/EventLoggerPipe.js';
import { FlushPipe } from '../pipes/FlushPipe.js';
import { DATABASE_MANAGER_TOKEN, IDatabaseManager } from '../../../api/core/database/DatabaseManager.js';

export class SocketMessageHandler implements ISocketMessageHandler {
    public constructor(
        @inject(EVENT_HANDLER_REGISTRY_TOKEN) private handlerRegistry: IEventHandlerRegistry,
        @inject(EMULATOR_TOKEN) private emulator: IEmulator,
        @inject(LOGGER_TOKEN) private logger: ILogger,
        @inject(CODEC_TOKEN) private codec: ICodec,
        @inject(CONFIG_REPOSITORY_TOKEN) private configRepository: IRepository,
        @inject(DATABASE_MANAGER_TOKEN) private databaseManager: IDatabaseManager,
    ) {
    }

    private async dispatchHandler(
        eventContext: EventContext,
        handler: Class<EventHandler>
    ): Promise<Response | Response[] | null> {
        return this.emulator.rootContainer
            .get<EventHandler>(handler)
            .handle(
                eventContext,
            );
    }

    public async handle(client: Client, data: Buffer): Promise<void> {
        const event = this.codec.decode(data);
        const pipeline = new Pipeline<EventContext, Response>(
            this.emulator.rootContainer
        );
        const eventContext = new EventContext(
            client,
            event,
            this.databaseManager.newEntityManager,
        );

        try {
            const response = await pipeline
                .send(eventContext)
                .through([
                    EventLoggerPipe,
                    FlushPipe,
                ])
                .then( (context: EventContext) => {
                    const handler = this.handlerRegistry.getByHeader(context.event.header);

                    if (!handler) {
                        throw new Error(`No handler found for header: ${event.header}`);
                    }

                    return this.dispatchHandler(context, handler);
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
