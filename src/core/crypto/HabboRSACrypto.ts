import { bitLength, fromByteArray, modPow, toUnsignedByteArray } from './BigIntUtils';

export class HabboRSACrypto {
    private readonly e: bigint;
    private readonly n: bigint;
    private readonly d: bigint | null;
    public readonly blockSize: number;

    public constructor(e: string, n: string, d?: string) {
        this.e = BigInt('0x' + e);
        this.n = BigInt('0x' + n);
        this.d = d !== undefined ? BigInt('0x' + d) : null;
        this.blockSize = Math.floor((bitLength(this.n) + 7) / 8);
    }

    public encrypt(data: Buffer): Buffer { return this.doEncrypt(data, true, 2); }
    public decrypt(data: Buffer): Buffer { return this.doDecrypt(data, false, 2); }
    public sign(data: Buffer): Buffer { return this.doEncrypt(data, false, 1); }
    public verify(data: Buffer): Buffer { return this.doDecrypt(data, true, 1); }

    private doPublic(x: bigint): bigint { return modPow(x, this.e, this.n); }

    private doPrivate(x: bigint): bigint {
        if (!this.d) throw new Error('Private key not configured');
        return modPow(x, this.d, this.n);
    }

    private doEncrypt(data: Buffer, isPublic: boolean, padType: number): Buffer {
        const parts: Buffer[] = [];
        let pos = 0;
        while (pos < data.length) {
            const { padded, newPos } = pkcs1Pad(data, pos, data.length, this.blockSize, padType);
            pos = newPos;
            const chunk = isPublic ? this.doPublic(fromByteArray(padded)) : this.doPrivate(fromByteArray(padded));
            const chunkBytes = toUnsignedByteArray(chunk);
            const out = Buffer.alloc(this.blockSize);
            chunkBytes.copy(out, this.blockSize - chunkBytes.length);
            parts.push(out);
        }
        return Buffer.concat(parts);
    }

    private doDecrypt(data: Buffer, isPublic: boolean, padType: number): Buffer {
        if (data.length % this.blockSize !== 0) {
            throw new Error(`Data length ${data.length} not a multiple of block size ${this.blockSize}`);
        }
        const parts: Buffer[] = [];
        for (let pos = 0; pos < data.length; pos += this.blockSize) {
            const chunk = isPublic
                ? this.doPublic(fromByteArray(data.subarray(pos, pos + this.blockSize)))
                : this.doPrivate(fromByteArray(data.subarray(pos, pos + this.blockSize)));
            const chunkBytes = toUnsignedByteArray(chunk);
            const aligned = Buffer.alloc(this.blockSize);
            chunkBytes.copy(aligned, this.blockSize - chunkBytes.length);
            parts.push(pkcs1Unpad(aligned, this.blockSize, padType));
        }
        return Buffer.concat(parts);
    }
}

function pkcs1Pad(
    src: Buffer, startPos: number, endPos: number, blockSize: number, padType: number,
): { padded: Buffer; newPos: number } {
    const result = Buffer.alloc(blockSize);
    const p = startPos;
    let end = Math.min(endPos, Math.min(src.length, p + blockSize - 11));
    const newPos = end;
    let i = end - 1;
    let n = blockSize;

    while (i >= p && n > 11) result[--n] = src[i--];
    result[--n] = 0;
    if (padType === 2) {
        while (n > 2) {
            let rand = 0;
            while (rand === 0) rand = Math.floor(Math.random() * 256);
            result[--n] = rand;
        }
    } else {
        while (n > 2) result[--n] = 0xff;
    }
    result[--n] = padType;
    result[--n] = 0;
    return { padded: result, newPos };
}

function pkcs1Unpad(b: Buffer, blockSize: number, padType: number): Buffer {
    let i = 0;
    while (i < b.length && b[i] === 0) i++;
    if (b.length - i !== blockSize - 1 || b[i] !== padType) {
        throw new Error(`PKCS#1 unpad: expected type ${padType} at offset ${i}, got ${b[i]}`);
    }
    i++;
    while (b[i] !== 0) {
        if (++i >= b.length) throw new Error('PKCS#1 unpad: missing zero separator');
    }
    return Buffer.from(b.subarray(i + 1));
}
