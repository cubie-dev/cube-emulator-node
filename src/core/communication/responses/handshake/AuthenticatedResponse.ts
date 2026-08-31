import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';
import type { User } from '../../../database/entities/User';

export class AuthenticatedResponse extends Response {
    public constructor(user: User) {
        super(ResponseHeader.AUTHENTICATED);

        this.addData(user.id); // account id
        this.addData([]); // suggestedLoginActions
        this.addData(user.id); // identity id
    }
}
