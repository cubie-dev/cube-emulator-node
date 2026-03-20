import { Response } from '../Response.js';
import { ResponseHeader } from '../ResponseHeader.js';

export class AuthenticatedResponse extends Response {
    public constructor() {
        super(ResponseHeader.AUTHENTICATED);
    }
}
