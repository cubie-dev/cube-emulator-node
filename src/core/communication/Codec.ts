import { Event } from './events/Event';
import { BinaryReader } from './BinaryReader';
import { Composer } from './composers/Composer.ts';
import { BinaryWriter } from './BinaryWriter';
import { type ICodec } from '../../api/core/communication/Codec';
import { isComposable, isMap, type ComposableData } from './ComposableData.ts';

export class Codec implements ICodec {
    public decode(data: Buffer): Event {
        const uint8Array = new Uint8Array(data);
        const reader = new BinaryReader(uint8Array.buffer);
        const messageLength = reader.readInt();
        const header = reader.readShort();

        return new Event(
            messageLength,
            header,
            reader
        );
    }

    public encode(response: Composer): ArrayBuffer {
        const data = response.data;
        const writer = new BinaryWriter();

        writer.writeShort(response.header);

        this.writeToWriter(writer, data);

        console.log(writer.getBuffer());

        const buffer = writer.getBuffer();

        return new BinaryWriter()
            .writeInt(buffer.byteLength)
            .writeBytes(buffer)
            .getBuffer();
    }

    private writeToWriter(
        writer: BinaryWriter,
        item: ComposableData|ComposableData[],
    ): void {
        const items = Array.isArray(item) ? item : [item];

        for (const item of items) {
            if (item === null) {
                writer.writeByte(0);
                return;
            }

            if (typeof item === 'string') {
                item.length === 0 ? writer.writeShort(0) : writer.writeString(item);
                return;
            }

            if (typeof item === 'number') {
                writer.writeInt(item);
                return;
            }

            if (typeof item === 'boolean') {
                writer.writeByte(item ? 1 : 0);
                return;
            }

            if (item instanceof ArrayBuffer) {
                writer.writeBytes(item);
                return;
            }

            if (isComposable(item)) {
                this.writeToWriter(writer, item.getData());
                return;
            }

            if (Array.isArray(item)) {
                writer.writeInt(item.length);
                this.writeToWriter(writer, item);
                return;
            }

            if (isMap(item)) {
                const entries = Object.entries(item);
                writer.writeInt(entries.length);
                for (const [key, value] of entries) {
                    this.writeToWriter(writer, key);
                    this.writeToWriter(writer, value);
                }
            }
        }
    }
}
