import { Response } from '../Response.js';
import { ResponseHeader } from '../ResponseHeader.js';
import { User } from '../../../../database/entities/User.js';

export class FigureUpdateResponse extends Response {
    public constructor(user: User) {
        super(ResponseHeader.USER_FIGURE);

        this.addData(user.look);
        this.addData(user.gender);
    }
}
