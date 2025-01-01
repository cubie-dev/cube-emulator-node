export class BinaryWriter
{
    private buffer: Uint8Array;
    private position: number;

    constructor()
    {
        this.buffer = new Uint8Array();
        this.position = 0;
    }

    public writeByte(byte: number): this
    {
        const array = new Uint8Array(1);

        array[0] = byte;

        this.appendArray(array);

        return this;
    }

    public writeBytes(bytes: ArrayBuffer | number[]): this
    {
        const array = new Uint8Array(bytes);

        this.appendArray(array);

        return this;
    }

    public writeShort(short: number): this
    {
        const array = new Uint8Array(2);

        array[0] = short >> 8;
        array[1] = short & 0xFF;

        this.appendArray(array);

        return this;
    }

    public writeInt(integer: number): this
    {
        const array = new Uint8Array(4);

        array[0] = integer >> 24;
        array[1] = integer >> 16;
        array[2] = integer >> 8;
        array[3] = integer & 0xFF;

        this.appendArray(array);

        return this;
    }

    public writeString(string: string, includeLength: boolean = true): this
    {
        const array = new TextEncoder().encode(string);

        if(includeLength)
        {
            this.writeShort(array.length);
            this.appendArray(array);
        }
        else
        {
            this.appendArray(array);
        }

        return this;
    }

    private appendArray(array: Uint8Array): void
    {
        if(!array) return;

        const mergedArray = new Uint8Array(((this.position + array.length) > this.buffer.length) ? (this.position + array.length) : this.buffer.length);

        mergedArray.set(this.buffer);
        mergedArray.set(array, this.position);

        this.buffer = mergedArray;
        this.position += array.length;
    }

    public getBuffer(): ArrayBuffer
    {
        return this.buffer.buffer;
    }

    public toString(encoding?: string): string
    {
        return new TextDecoder(encoding).decode(this.buffer);
    }
}
