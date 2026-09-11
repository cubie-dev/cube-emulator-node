import { Composer } from '../Composer.ts';
import { ComposerHeader } from '../ComposerHeader.ts';

export class HomeRoomComposer extends Composer {
    public constructor() {
        super(ComposerHeader.USER_HOME_ROOM);

        // TODO
        this.appendData(0); // home room id
        this.appendData(0); // hotel view = 0. skip and go to home room > 0
    }
}
