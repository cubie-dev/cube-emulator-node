import { type Composer } from '../../../composers/Composer.ts';
import { EventContext } from '../../EventContext';
import { EventHandler } from '../../EventHandler';
import { User } from '../../../../database/entities/User';
import { AuthenticatedComposer } from '../../../composers/handshake/AuthenticatedComposer.ts';
import { inject } from 'inversify';
import { type GameServer, GAME_SERVER_TOKEN } from '../../../../../api/core/communication/GameServer';
import { UserInfoComposer } from '../../../composers/user/UserInfoComposer.ts';
import { FigureUpdateComposer } from '../../../composers/user/FigureUpdateComposer.ts';
import { HomeRoomComposer } from '../../../composers/user/HomeRoomComposer.ts';

export class SsoEventHandler extends EventHandler {
    public constructor(
        @inject(GAME_SERVER_TOKEN) private readonly socketServer: GameServer,
    ) {
        super();
    }

    public async handle(context: EventContext): Promise<Composer[]> {
        const authToken = context.event.reader.readString();

        const user = await context.em.getRepository(User).findOne({
            authToken,
        }, {
            populate: ['stats']
        });

        if (!user) {
            this.socketServer.disposeClient(context.client);

            return [];
        }

        // user.authToken = null;

        context.client.user = user;

        return [
            new AuthenticatedComposer(user),
            new UserInfoComposer(user),
            new FigureUpdateComposer(user),
            new HomeRoomComposer(),
        ];
    }
}
