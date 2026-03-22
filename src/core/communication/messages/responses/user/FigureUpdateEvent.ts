import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';
import { User } from '../../../../database/entities/User';

export class FigureUpdateResponse extends Response {
    public constructor(user: User) {
        super(ResponseHeader.USER_FIGURE);

        this.addData(user.look);
        this.addData(user.gender);
    }
}
