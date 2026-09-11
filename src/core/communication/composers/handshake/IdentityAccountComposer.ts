import { Composer } from '../Composer.ts';
import { ComposerHeader } from '../ComposerHeader.ts';

export class IdentityAccountComposer extends Composer {
    public constructor(accounts: Record<number, string>) {
        super(ComposerHeader.HANDSHAKE_IDENTITY_ACCOUNT);

        this.appendData(accounts);
    }
}
