import { Composer } from './Composer.ts';
import { ComposerHeader } from './ComposerHeader.ts';

export class PingComposer extends Composer {
    public constructor() {
        super(ComposerHeader.CLIENT_PING);
    }
}
