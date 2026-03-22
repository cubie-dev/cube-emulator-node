import { Response } from 'core/communication/messages/responses/Response';
import { EventContext } from '../../EventContext';
import { EventHandler } from '../../EventHandler';
import { User } from '../../../../../database/entities/User';
import { AuthenticatedResponse } from '../../../responses/handshake/AuthenticatedResponse';
import { inject } from 'inversify';
import { type ISocketServer, SOCKET_SERVER_TOKEN } from '../../../../../../api/core/communication/SocketServer';
import { LoadGameUrlResponse } from '../../../responses/handshake/LoadGameUrlResponse';
import { GameType } from '../../../../../../game/GameType';
import { UserInfoResponse } from '../../../responses/user/UserInfoResponse';
import { FigureUpdateResponse } from '../../../responses/user/FigureUpdateEvent';

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
