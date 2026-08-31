
export class BinaryReader {
    private position: number;
    private dataView: DataView<ArrayBuffer>;

    constructor(buffer: ArrayBuffer)
    {
        this.position = 0;
        this.dataView = new DataView<ArrayBuffer>(buffer);
    }

    public readBytes(length: number): BinaryReader
    {
        const buffer = new BinaryReader(this.dataView.buffer.slice(this.position, this.position + length));

        this.position += length;

        return buffer;
    }

    public readByte(): number
    {
        const byte = this.dataView.getInt8(this.position);

        this.position++;

        return byte;
    }

    public readShort(): number
    {
        const short = this.dataView.getInt16(this.position);

        this.position += 2;

        return short;
    }

    public readInt(): number
    {
        const int = this.dataView.getInt32(this.position);

        this.position += 4;

        return int;
    }

    public readFloat(): number
    {
        const float = this.dataView.getFloat32(this.position);

        this.position += 4;

        return float;
    }

    public readDouble(): number
    {
        const double = this.dataView.getFloat64(this.position);

        this.position += 8;

        return double;
    }

    public readString(): string
    {
        const length = this.readShort();
        const buffer = this.readBytes(length);

        return buffer.toString('utf8');
    }

    public remaining(): number
    {
        return this.dataView.byteLength - this.position;
    }

    public inspect(): string
    {
        const bytes = Buffer.from(this.dataView.buffer.slice(this.position));
        if (bytes.length === 0) return '(empty)';

        const parts: string[] = [];
        let i = 0;

        while (i < bytes.length) {
            const rem = bytes.length - i;

            // Try string: 2-byte big-endian length prefix + UTF-8 content
            if (rem >= 2) {
                const strLen = bytes.readInt16BE(i);
                if (strLen >= 0 && strLen <= rem - 2) {
                    const strBytes = bytes.slice(i + 2, i + 2 + strLen);
                    if (strLen === 0 || isProbablyText(strBytes)) {
                        parts.push(`string(${JSON.stringify(strBytes.toString('utf-8'))})`);
                        i += 2 + strLen;
                        continue;
                    }
                }
            }

            // Try int: 4 bytes
            if (rem >= 4) {
                parts.push(`int(${bytes.readInt32BE(i)})`);
                i += 4;
                continue;
            }

            // Try short: 2 bytes
            if (rem >= 2) {
                parts.push(`short(${bytes.readInt16BE(i)})`);
                i += 2;
                continue;
            }

            parts.push(`byte(${bytes[i]})`);
            i += 1;
        }

        return parts.join(', ');
    }

    public toString(encoding?: string): string
    {
        return new TextDecoder().decode(this.dataView.buffer);
    }

    public toArrayBuffer(): ArrayBuffer
    {
        return this.dataView.buffer;
    }
}

function isProbablyText(bytes: Buffer): boolean {
    let printable = 0;
    for (const b of bytes) {
        if ((b >= 32 && b <= 126) || b > 127) printable++;
    }
    return printable / bytes.length >= 0.8;
}
