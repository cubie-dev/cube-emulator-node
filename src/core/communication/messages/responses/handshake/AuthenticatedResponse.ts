import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';

export class AuthenticatedResponse extends Response {
    public constructor() {
        super(ResponseHeader.AUTHENTICATED);
    }
}
