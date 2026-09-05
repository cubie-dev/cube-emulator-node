import { Composer } from '../Composer.ts';
import { ComposerHeader } from '../ComposerHeader.ts';

export class InitDiffieHandshakeComposer extends Composer {
    public constructor(signedPrime: string, signedGenerator: string) {
        super(ComposerHeader.HANDSHAKE_INIT_DIFFIE);
        this.appendData(signedPrime);
        this.appendData(signedGenerator);
    }
}
