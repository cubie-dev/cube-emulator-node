export class HabboRC4 {
    private i = 0;
    private j = 0;
    private readonly table = new Uint8Array(256);

    public constructor(key: Uint8Array) {
        for (let i = 0; i < 256; i++) this.table[i] = i;
        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + this.table[i]! + (key[i % key.length]! & 0xff)) % 256;
            const tmp = this.table[i]!; this.table[i] = this.table[j]!; this.table[j] = tmp;
        }
        this.i = 0;
        this.j = 0;
    }

    public parse(bytes: Buffer): void {
        for (let idx = 0; idx < bytes.length; idx++) {
            this.i = (this.i + 1) % 256;
            this.j = (this.j + this.table[this.i]!) % 256;
            const tmp = this.table[this.i]!; this.table[this.i] = this.table[this.j]!; this.table[this.j] = tmp;
            bytes[idx] = bytes[idx]! ^ this.table[(this.table[this.i]! + this.table[this.j]!) % 256]!;
        }
    }
}
