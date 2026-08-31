import { HabboRSACrypto } from './HabboRSACrypto';
import { HabboDiffieHellman } from './HabboDiffieHellman';

export class HabboEncryption {
    public readonly rsa: HabboRSACrypto;
    public readonly dh: HabboDiffieHellman;

    public constructor(e: string, n: string, d: string) {
        this.rsa = new HabboRSACrypto(e, n, d);
        this.dh = new HabboDiffieHellman(this.rsa);
    }
}
