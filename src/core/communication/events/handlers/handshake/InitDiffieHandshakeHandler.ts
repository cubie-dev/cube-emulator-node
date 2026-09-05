import { inject } from 'inversify';
import { EventHandler } from '../../EventHandler';
import type { EventContext } from '../../EventContext';
import { CONFIG_REPOSITORY_TOKEN, type IRepository } from '../../../../../api/core/config/Repository';
import { HabboEncryption } from '../../../crypto/HabboEncryption';
import { InitDiffieHandshakeComposer } from '../../../composers/handshake/InitDiffieHandshakeComposer.ts';

export class InitDiffieHandshakeHandler extends EventHandler {
    public constructor(
        @inject(CONFIG_REPOSITORY_TOKEN) private readonly config: IRepository,
    ) {
        super();
    }

    public handle(context: EventContext): InitDiffieHandshakeComposer | null {
        const e = this.config.get<string>('encryption.e', '');
        const n = this.config.get<string>('encryption.n', '');
        const d = this.config.get<string>('encryption.d', '');

        if (!e || !n || !d) {
            return null;
        }

        const encryption = new HabboEncryption(e, n, d);
        context.client.encryption = encryption;

        return new InitDiffieHandshakeComposer(
            encryption.dh.getSignedPrime(),
            encryption.dh.getSignedGenerator(),
        );
    }
}
