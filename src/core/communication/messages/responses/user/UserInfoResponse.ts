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
        this.addData(''); // motto TODO
        this.addData(''); //real name TODO?
        this.addData(false); // direct mail
        this.addData(user.stats.respectReceived);
        this.addData(0); // respect given today
        this.addData(0); // petRespectsToGiveToday
        this.addData(false); //stream publish allowed
        this.addData('01-01-1970 00:00:00');
        this.addData(false); // allowNameChange
        this.addData(false); //safety locked
    }
}
