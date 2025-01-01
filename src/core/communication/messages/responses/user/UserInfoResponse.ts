import { Response } from '../Response';
import { User } from '../../../../database/entities/User';
import { ResponseHeader } from '../ResponseHeader';

export class UserInfoResponse extends Response {
    public constructor(user: User) {
        super(ResponseHeader.USER_INFO);

        this.addData(user.id);
        this.addData(user.username);
        this.addData(user.look);
        this.addData(user.gender);
        this.addData(user.motto);
        this.addData(user.realName);
        this.addData(false); // direct mail
        this.addData(user.settings.respectReceived);
        this.addData(user.settings.respectsToGiveToday);
        this.addData(user.settings.petRespectsToGiveToday);
        this.addData(false); //stream publish allowed
        this.addData('01-01-1970 00:00:00');
        this.addData(user.settings.allowNameChange);
        this.addData(false); //safety locked
    }
}
