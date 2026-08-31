import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';

export class IdentityAccountResponse extends Response {
    public constructor(accounts: Record<number, string>) {
        super(ResponseHeader.HANDSHAKE_IDENTITY_ACCOUNT);

        this.addData(accounts);
    }
}
