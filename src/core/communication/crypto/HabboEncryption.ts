import { HabboRSACrypto } from './HabboRSACrypto.ts';
import { HabboDiffieHellman } from './HabboDiffieHellman.ts';

export class HabboEncryption {
    public readonly rsa: HabboRSACrypto;
    public readonly dh: HabboDiffieHellman;

    public constructor(e: string, n: string, d: string) {
        this.rsa = new HabboRSACrypto(e, n, d);
        this.dh = new HabboDiffieHellman(this.rsa);
    }
}
