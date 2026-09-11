import { type ISocketMessageHandler } from '../../api/core/communication/MessageHandler';
import { Client } from './Client';
import { inject } from 'inversify';
import {
    EVENT_HANDLER_REGISTRY_TOKEN,
    type IEventHandlerRegistry,
} from '../../api/core/communication/EventHandlerRegistry';
import { EMULATOR_TOKEN, type IEmulator } from '../../api/core/Emulator';
import { type ILogger, LOGGER_TOKEN } from '../../api/core/logger/Logger';
import { EventContext } from './events/EventContext';
import { type Composer } from './composers/Composer.ts';
import { LogLevel } from '../logging/LogLevel';
import { Pipeline } from '../support/pipeline/Pipeline';
import { type EventHandler } from './events/EventHandler';
import { EventLoggerPipe } from './pipes/EventLoggerPipe';
import { FlushPipe } from './pipes/FlushPipe';
import { CodecPipe } from './pipes/CodecPipe';
import { EventContextPipe } from './pipes/EventContextPipe';
import { type Class } from '../support/Class';
import { UnknownHandlerError } from './UnknownHandlerError';
import { type RawMessage } from './RawMessage';

export class SocketMessageHandler implements ISocketMessageHandler {
    public constructor(
        @inject(EVENT_HANDLER_REGISTRY_TOKEN) private readonly handlerRegistry: IEventHandlerRegistry,
        @inject(EMULATOR_TOKEN) private readonly emulator: IEmulator,
        @inject(LOGGER_TOKEN) private readonly logger: ILogger,
    ) {}

    public async handle(client: Client, data: Buffer): Promise<void> {
        const pipeline = new Pipeline<RawMessage, ArrayBuffer[]>(
            this.emulator.rootContainer,
        );

        try {
            const response = await pipeline
                .send({ client, data })
                .wrap(CodecPipe)
                .pipe(EventContextPipe)
                .pipe(EventLoggerPipe)
                .pipe(FlushPipe)
                .then(async (context: EventContext) => {
                    const handler = this.handlerRegistry.getByHeader(context.event.header);

                    if (!handler) {
                        throw new UnknownHandlerError();
                    }

                    return await this.dispatchHandler(context, handler);
                });


            if (response) {
                await this.flushAndRespond(client, response);
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                this.logger.log('Network', LogLevel.ERROR, `Error handling message: ${e.message}`);
            }
        }
    }

    private async dispatchHandler(
        eventContext: EventContext,
        handler: Class<EventHandler>,
    ): Promise<Composer | Composer[] | null> {
        return eventContext.container
            .get<EventHandler>(handler)
            .handle(eventContext);
    }

    private async flushAndRespond(client: Client, buffer: ArrayBuffer | ArrayBuffer[]): Promise<void> {
        const buffers = Array.isArray(buffer) ? buffer : [buffer];

        for (const b of buffers) {
            client.send(b, (err?: Error) => {
                if (err) {
                    this.logger.log('Network', LogLevel.ERROR, `Error sending response: ${err}`);
                }
            });
        }
    }
}
