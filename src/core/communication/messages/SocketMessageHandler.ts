import { ISocketMessageHandler } from '../../../api/core/communication/MessageHandler';
import { Client } from '../Client';
import { inject } from 'inversify';
import {
    EVENT_HANDLER_REGISTRY_TOKEN,
    IEventHandlerRegistry
} from '../../../api/core/communication/IncomingMessageHandlerRegistry';
import { EMULATOR_TOKEN, IEmulator } from '../../../api/core/Emulator';
import { ILogger, LOGGER_TOKEN } from '../../../api/core/logger/Logger';
import { Response } from './responses/Response';
import { Codec } from '../Codec';
import { LogLevel } from '../../logging/LogLevel';

// TODO rename
export class SocketMessageHandler implements ISocketMessageHandler {
    public constructor(
        @inject(EVENT_HANDLER_REGISTRY_TOKEN) private handlerRepository: IEventHandlerRegistry,
        @inject(EMULATOR_TOKEN) private emulator: IEmulator,
        @inject(LOGGER_TOKEN) private logger: ILogger,
        private _codec: Codec,
    ) {
    }
    public handle(client: Client, data: Buffer): void {
        const clientRequest = this._codec.decode(data);

        this.logger.log('Network', LogLevel.INFO, `Got header: ${clientRequest.header}`);

        try {
            const handler = this.handlerRepository.getByHeader(clientRequest.header);

            if (!handler) {
                this.logger.log('Network', LogLevel.WARN, `No handler found for header: ${clientRequest.header}`);
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
            this.logger.log('Network', LogLevel.ERROR, `Error while handling: ${clientRequest.header}`);
        }
    }

    private sendResponse(client: Client, response: Response): void {
        const arrayBuffer = this._codec.encode(response);

        client.send(arrayBuffer, (err: Error): void => {
            if (!err) {
                return;
            }

            this.logger.log('Network', LogLevel.ERROR, `Error while sending response: ${err}`);
        });
    }
}
