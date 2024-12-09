import { Response } from './Response';
import { ResponseHeader } from './ResponseHeader';

export class PongResponse extends Response {
    public constructor() {
        super(ResponseHeader.CLIENT_PONG);
    }
}
