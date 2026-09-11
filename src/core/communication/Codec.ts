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

        this.writeFields(writer, data);

        const buffer = writer.getBuffer();

        return new BinaryWriter()
            .writeInt(buffer.byteLength)
            .writeBytes(buffer)
            .getBuffer();
    }

    private writeFields(writer: BinaryWriter, fields: ComposableData[]): void {
        for (const field of fields) {
            this.writeField(writer, field);
        }
    }

    private writeField(writer: BinaryWriter, field: ComposableData): void {
        if (field === null) {
            writer.writeByte(0);
            return;
        }

        if (typeof field === 'string') {
            field.length === 0 ? writer.writeShort(0) : writer.writeString(field);
            return;
        }

        if (typeof field === 'number') {
            writer.writeInt(field);
            return;
        }

        if (typeof field === 'boolean') {
            writer.writeByte(field ? 1 : 0);
            return;
        }

        if (field instanceof ArrayBuffer) {
            writer.writeBytes(field);
            return;
        }

        if (isComposable(field)) {
            this.writeFields(writer, field.getData());
            return;
        }

        if (isMap(field)) {
            const entries = Object.entries(field);
            writer.writeInt(entries.length);

            for (const [key, value] of entries) {
                this.writeField(writer, key);
                this.writeField(writer, value);
            }
        }
    }
}
