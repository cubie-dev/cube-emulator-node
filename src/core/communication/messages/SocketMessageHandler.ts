import { ISocketMessageHandler } from '../../../api/core/communication/MessageHandler';
import { Client } from '../Client';
import { inject } from 'inversify';
import { IEventHandlersRegistry, EVENT_HANDLERS_REGISTRY_TOKEN } from '../../../api/core/communication/IncomingMessageHandlerRegistry';
import { EMULATOR_TOKEN, IEmulator } from '../../../api/core/Emulator';
import { ILogger, LOGGER_TOKEN } from '../../../api/core/logger/Logger';
import { Response } from './responses/Response';
import { Codec } from '../Codec';

// TODO rename
export class SocketMessageHandler implements ISocketMessageHandler {
    public constructor(
        @inject(EVENT_HANDLERS_REGISTRY_TOKEN) private handlerRepository: IEventHandlersRegistry,
        @inject(EMULATOR_TOKEN) private emulator: IEmulator,
        @inject(LOGGER_TOKEN) private logger: ILogger,
        private _codec: Codec,
    ) {
    }
    public handle(client: Client, data: Buffer): void {
        const clientRequest = this._codec.decode(data);

        this.logger.log('Network', 'info', `Got header: ${clientRequest.header}`);

        try {
            const handler = this.handlerRepository.getByHeader(clientRequest.header);

            if (!handler) {
                this.logger.log('Network', 'warn', `No handler found for header: ${clientRequest.header}`);
                return;
            }

            const response = this.emulator.container
                .resolve(handler)
                .handle(clientRequest, client);

            if (!response) {
                return;
            }

            this.sendResponse(client, response);
        } catch (e: unknown) {
            this.logger.log('Network', 'error', `Error while handling: ${clientRequest.header}`);
        }
    }

    private sendResponse(client: Client, response: Response): void {
        const arrayBuffer = this._codec.encode(response);

        client.send(arrayBuffer, (err: Error): void => {
            if (!err) {
                return;
            }

            this.logger.log('Network', 'error', `Error while sending response: ${err}`);
        });
    }
}
