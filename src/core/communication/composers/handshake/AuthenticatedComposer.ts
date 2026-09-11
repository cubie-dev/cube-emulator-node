import { Composer } from '../Composer.ts';
import { ComposerHeader } from '../ComposerHeader.ts';
import type { User } from '../../../database/entities/User';

export class AuthenticatedComposer extends Composer {
    public constructor(user: User) {
        super(ComposerHeader.AUTHENTICATED);

        this.appendData(user.id); // account id
        this.appendData([]); // suggestedLoginActions
        this.appendData(user.id); // identity id
    }
}
