import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';

export class InitDiffieHandshakeResponse extends Response {
    public constructor(signedPrime: string, signedGenerator: string) {
        super(ResponseHeader.HANDSHAKE_INIT_DIFFIE);
        this.addData(signedPrime);
        this.addData(signedGenerator);
    }
}
