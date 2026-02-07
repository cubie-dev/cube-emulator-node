import { Response } from './Response';
import { ResponseHeader } from './ResponseHeader';

export class PingResponse extends Response {
    public constructor() {
        super(ResponseHeader.CLIENT_PING);
    }
}
