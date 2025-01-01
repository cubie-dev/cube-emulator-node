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
import * as console from 'node:console';

@injectable()
export class SocketMessageHandler implements ISocketMessageHandler {
    public constructor(
        @inject(EVENT_HANDLER_REGISTRY_TOKEN) private handlerRegistry: IEventHandlerRegistry,
        @inject(EMULATOR_TOKEN) private emulator: IEmulator,
        @inject(LOGGER_TOKEN) private logger: ILogger,
        @inject(CODEC_TOKEN) private codec: ICodec,
        @inject(EVENT_CONTEXT_FACTORY_TOKEN) private eventContextFactory: EventContextFactory,
    ) {
    }

    public async handle(client: Client, data: Buffer): Promise<void> {
        // TODO some sort of middleware/pipeline would be nice here
        const event = this.codec.decode(data);

        this.logger.log(
            'Network',
            LogLevel.INFO,
            `Got header: ${event.header}`
        );

        try {
            const handler = this.handlerRegistry.getByHeader(event.header);

            if (!handler) {
                this.logger.log('Network', LogLevel.WARN, `No handler found for header: ${event.header}`);
                return;
            }

            const eventContext = this.eventContextFactory.makeForClient(client);

            const response = await this.emulator.rootContainer
                .resolve(handler)
                .handle(
                    event,
                    eventContext,
                );

            if (!response) {
                return;
            }

            void this.flushAndRespond(eventContext, response);
        } catch (e: unknown) {
            this.logger.log('Network', LogLevel.ERROR, `Error while handling: ${event.header}; ${e}`);
        }
    }

    private async flushAndRespond(context: EventContext, response: Response|Response[]): Promise<void> {
        await context.flush();

        const responses = Array.isArray(response) ? response : [response];

        for (const response of responses) {
            this.logger.log(
                'Network',
                LogLevel.INFO,
                `Responding with header: ${response.header}`
            )
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
