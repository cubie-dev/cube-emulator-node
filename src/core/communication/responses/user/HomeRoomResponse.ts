import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';
import { User } from '../../../database/entities/User';

export class HomeRoomResponse extends Response {
    public constructor(user: User) {
        super(ResponseHeader.USER_HOME_ROOM);

        // TODO
        this.addData(0); // home room id
        this.addData(0); // hotel view = 0. skip and go to home room > 0
    }
}
