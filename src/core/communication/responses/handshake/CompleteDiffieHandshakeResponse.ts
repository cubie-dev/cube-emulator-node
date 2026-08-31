import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';

export class CompleteDiffieHandshakeResponse extends Response {
    public constructor(serverPublicKey: string, clientEncryption: boolean) {
        super(ResponseHeader.HANDSHAKE_COMPLETE_DIFFIE);
        this.addData(serverPublicKey);
        this.addData(clientEncryption);
    }
}
