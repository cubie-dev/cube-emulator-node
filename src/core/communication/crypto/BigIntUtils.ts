export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = ((base % modulus) + modulus) % modulus;
    while (exponent > 0n) {
        if (exponent & 1n) result = (result * base) % modulus;
        exponent >>= 1n;
        base = (base * base) % modulus;
    }
    return result;
}

export function bitLength(n: bigint): number {
    if (n <= 0n) return 0;
    return n.toString(2).length;
}

export function toUnsignedByteArray(n: bigint): Buffer {
    if (n === 0n) return Buffer.alloc(1, 0);
    const hex = n.toString(16).padStart(Math.ceil(n.toString(16).length / 2) * 2, '0');
    return Buffer.from(hex, 'hex');
}

export function fromByteArray(bytes: Buffer): bigint {
    if (bytes.length === 0) return 0n;
    return BigInt('0x' + bytes.toString('hex'));
}

function millerRabin(n: bigint, rounds: number): boolean {
    if (n < 2n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;

    let r = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) { d >>= 1n; r++; }

    const byteLen = Math.ceil(bitLength(n) / 8);
    for (let i = 0; i < rounds; i++) {
        const aBytes = new Uint8Array(byteLen);
        crypto.getRandomValues(aBytes);
        const a = BigInt('0x' + Buffer.from(aBytes).toString('hex')) % (n - 3n) + 2n;
        let x = modPow(a, d, n);
        if (x === 1n || x === n - 1n) continue;
        let passed = false;
        for (let j = 0n; j < r - 1n; j++) {
            x = modPow(x, 2n, n);
            if (x === n - 1n) { passed = true; break; }
        }
        if (!passed) return false;
    }
    return true;
}

export function generateProbablePrime(bits: number): bigint {
    const byteLen = Math.ceil(bits / 8);
    while (true) {
        const bytes = new Uint8Array(byteLen);
        crypto.getRandomValues(bytes);
        bytes[0] = bytes[0]! | 0x80;
        bytes[byteLen - 1] = bytes[byteLen - 1]! | 0x01;
        const candidate = BigInt('0x' + Buffer.from(bytes).toString('hex'));
        if (millerRabin(candidate, 20)) return candidate;
    }
}
