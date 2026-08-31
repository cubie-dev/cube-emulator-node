import { generateProbablePrime, modPow, toUnsignedByteArray } from './BigIntUtils.ts';
import type { HabboRSACrypto } from './HabboRSACrypto.ts';

export class HabboDiffieHellman {
    private static readonly BITS = 128;

    private prime: bigint;
    private generator: bigint;
    private readonly privateKey: bigint;
    private readonly publicKey: bigint;

    public constructor(private readonly rsa: HabboRSACrypto) {
        this.prime = generateProbablePrime(HabboDiffieHellman.BITS);
        this.generator = generateProbablePrime(HabboDiffieHellman.BITS);

        if (this.generator > this.prime) {
            [this.prime, this.generator] = [this.generator, this.prime];
        }

        this.privateKey = generateProbablePrime(HabboDiffieHellman.BITS);
        this.publicKey = modPow(this.generator, this.privateKey, this.prime);
    }

    private sign(value: bigint): string {
        return this.rsa.sign(Buffer.from(value.toString(10), 'utf-8')).toString('hex');
    }

    private decrypt(hex: string): bigint {
        return BigInt(this.rsa.decrypt(Buffer.from(hex, 'hex')).toString('utf-8'));
    }

    public getSignedPrime(): string { return this.sign(this.prime); }
    public getSignedGenerator(): string { return this.sign(this.generator); }
    public getPublicKey(): string { return this.sign(this.publicKey); }

    public getSharedKey(clientPublicKeyHex: string): Uint8Array {
        const clientPublic = this.decrypt(clientPublicKeyHex);
        return toUnsignedByteArray(modPow(clientPublic, this.privateKey, this.prime));
    }
}
