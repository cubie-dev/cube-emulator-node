import { Composer } from '../Composer.ts';
import { ComposerHeader } from '../ComposerHeader.ts';
import { User } from '../../../database/entities/User';

export class FigureUpdateComposer extends Composer {
    public constructor(user: User) {
        super(ComposerHeader.USER_FIGURE);

        this.appendData(user.look);
        this.appendData(user.gender);
    }
}
