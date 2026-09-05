import { Composer } from '../Composer.ts';
import { User } from '../../../database/entities/User';
import { ComposerHeader } from '../ComposerHeader.ts';

export class UserInfoComposer extends Composer {
    public constructor(user: User) {
        super(ComposerHeader.USER_INFO);

        this.appendData(user.id);
        this.appendData(user.username);
        this.appendData(user.look);
        this.appendData(user.gender);
        this.appendData(''); // motto TODO / customdata
        this.appendData(''); //real name TODO?
        this.appendData(false); // direct mail
        this.appendData(user.stats.respectReceived); // respectTotal
        this.appendData(0); // respectLeft
        this.appendData(0); // petRespectLeft
        this.appendData(false); //streamPublishingAllowed
        this.appendData('01-01-1970 00:00:00'); // lastAccessDate
        this.appendData(false); // allowNameChange
        this.appendData(false); //safety locked
    }
}
