
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

    public toString(encoding?: string): string
    {
        return new TextDecoder().decode(this.dataView.buffer);
    }

    public toArrayBuffer(): ArrayBuffer
    {
        return this.dataView.buffer;
    }
}
