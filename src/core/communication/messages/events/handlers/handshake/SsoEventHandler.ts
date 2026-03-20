import { Response } from 'core/communication/messages/responses/Response.js';
import { EventContext } from '../../EventContext.js';
import { EventHandler } from '../../EventHandler.js';
import { User } from '../../../../../database/entities/User.js';
import { AuthenticatedResponse } from '../../../responses/handshake/AuthenticatedResponse.js';
import { inject } from 'inversify';
import { ISocketServer, SOCKET_SERVER_TOKEN } from '../../../../../../api/core/communication/SocketServer.js';
import { LoadGameUrlResponse } from '../../../responses/handshake/LoadGameUrlResponse.js';
import { GameType } from '../../../../../../game/GameType.js';
import { UserInfoResponse } from '../../../responses/user/UserInfoResponse.js';
import { FigureUpdateResponse } from '../../../responses/user/FigureUpdateEvent.js';

export class SsoEventHandler extends EventHandler {
    public constructor(
        @inject(SOCKET_SERVER_TOKEN) private readonly socketServer: ISocketServer,
    ) {
        super();
    }

    public async handle(context: EventContext): Promise<Response[]> {
        const authToken = context.event.reader.readString();

        const user = await context.em.getRepository(User).findOne({
            authToken,
        }, {
            populate: ['stats']
        });

        if (!user) {
            this.socketServer.disposeClient(context.client);
        }

        // user.authToken = null;

        context.client.user = user;

        return [
            new AuthenticatedResponse(),
            new LoadGameUrlResponse(GameType.HOTEL),
            new UserInfoResponse(user),
            new FigureUpdateResponse(user),
        ];
    }
}
