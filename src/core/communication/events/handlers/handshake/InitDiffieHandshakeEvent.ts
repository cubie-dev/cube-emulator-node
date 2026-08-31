import { inject } from 'inversify';
import { EventHandler } from '../../EventHandler';
import type { EventContext } from '../../EventContext';
import { CONFIG_REPOSITORY_TOKEN, type IRepository } from '../../../../../api/core/config/Repository';
import { HabboEncryption } from '../../../crypto/HabboEncryption';
import { InitDiffieHandshakeResponse } from '../../../responses/handshake/InitDiffieHandshakeResponse';

export class InitDiffieHandshakeEvent extends EventHandler {
    public constructor(
        @inject(CONFIG_REPOSITORY_TOKEN) private readonly config: IRepository,
    ) {
        super();
    }

    public handle(context: EventContext): InitDiffieHandshakeResponse | null {
        const e = this.config.get<string>('encryption.e', '');
        const n = this.config.get<string>('encryption.n', '');
        const d = this.config.get<string>('encryption.d', '');

        if (!e || !n || !d) {
            return null;
        }

        const encryption = new HabboEncryption(e, n, d);
        context.client.encryption = encryption;

        return new InitDiffieHandshakeResponse(
            encryption.dh.getSignedPrime(),
            encryption.dh.getSignedGenerator(),
        );
    }
}
