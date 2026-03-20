import { Response } from './Response.js';
import { ResponseHeader } from './ResponseHeader.js';

export class PingResponse extends Response {
    public constructor() {
        super(ResponseHeader.CLIENT_PING);
    }
}
