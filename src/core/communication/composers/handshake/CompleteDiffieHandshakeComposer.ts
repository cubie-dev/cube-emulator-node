import { Composer } from '../Composer.ts';
import { ComposerHeader } from '../ComposerHeader.ts';

export class CompleteDiffieHandshakeComposer extends Composer {
    public constructor(serverPublicKey: string, clientEncryption: boolean) {
        super(ComposerHeader.HANDSHAKE_COMPLETE_DIFFIE);
        this.appendData(serverPublicKey);
        this.appendData(clientEncryption);
    }
}
