import { Response } from 'core/communication/messages/responses/Response';
import { Event } from '../../Event';
import { EventContext } from '../../EventContext';
import { EventHandler } from '../../EventHandler';
import { User } from '../../../../../database/entities/User';
import { AuthenticatedResponse } from '../../../responses/handshake/AuthenticatedResponse';
import { inject } from 'inversify';
import { ISocketServer, SOCKET_SERVER_TOKEN } from '../../../../../../api/core/communication/SocketServer';
import { PongResponse } from '../../../responses/PongResponse';
import { LoadGameUrlResponse } from '../../../responses/handshake/LoadGameUrlResponse';
import { GameType } from '../../../../../../game/GameType';
import { UserInfoResponse } from '../../../responses/user/UserInfoResponse';
import { wrap } from '@mikro-orm/core';
import { FigureUpdateResponse } from '../../../responses/user/FigureUpdateEvent';

export class SsoEventHandler extends EventHandler {
    public constructor(
        @inject(SOCKET_SERVER_TOKEN) private socketServer: ISocketServer,
    ) {
        super();
    }
    public async handle(event: Event, context: EventContext): Promise<Response[]> {
        const authTicket = event.reader.readString();

        const user = await context.entityManager.getRepository(User).findOne({
            authTicket
        }, {
            populate: ['settings']
        });

        if (!user) {
            this.socketServer.disposeClient(context.client);
        }

        context.client.user = user;

        return [
            new AuthenticatedResponse(),
            new LoadGameUrlResponse(GameType.HOTEL),
            new UserInfoResponse(user),
            new FigureUpdateResponse(user),
        ];
    }
}
