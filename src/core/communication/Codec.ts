import { Event } from './messages/events/Event';
import { BinaryReader } from './messages/BinaryReader';
import { Response } from './messages/responses/Response';
import { BinaryWriter } from './messages/BinaryWriter';
import { type ICodec } from '../../api/core/communication/Codec';
import { isMapLike } from '../support/helpers/isMapLike';
import type { Primitive } from '../support/helpers/Primitive.ts';

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

    public encode(response: Response): ArrayBuffer {
        const data = response.data;
        const writer = new BinaryWriter();

        writer.writeShort(response.header);

        for (const item of data) {
            let type: string = typeof item;

            if (type === 'object') {
                if (item === null) {
                    type = 'null';
                }
                    // else if(item instanceof Byte) type = 'byte';
                // else if(item instanceof Short) type = 'short';
                else if (item instanceof ArrayBuffer) {
                    type = 'arraybuffer';
                } else if (isMapLike(item)) {
                    type = 'map';
                } else if (Array.isArray(item)) {
                    type = 'array';
                }
            }

            switch (type) {
                case 'string':
                case 'number':
                case 'boolean':
                    this.writePrimitive(writer, item as Primitive);
                    break;
                case 'arraybuffer':
                    writer.writeBytes(item as ArrayBuffer);
                    break;
                case 'array':
                    // TODO this of cource isn't always a short. Should be changed in the future
                    writer.writeInt((item as unknown[]).length);
                    (item as unknown[]).forEach((byte) => {
                        writer.writeShort(byte as number);
                    });
                    break;
                case 'map': {
                    const entries = Object.entries(item as Record<string | number, unknown>);
                    writer.writeInt(entries.length);
                    for (const [key, value] of entries) {
                        this.writePrimitive(writer, key);
                        this.writePrimitive(writer, value as Primitive);
                    }
                    break;
                }
                default:
                    writer.writeByte(0);
                    break;
            }
        }

        const buffer = writer.getBuffer();

        return new BinaryWriter()
            .writeInt(buffer.byteLength)
            .writeBytes(buffer)
            .getBuffer();
    }

    private writePrimitive(writer: BinaryWriter, value: Primitive) {
        let type = typeof value;

        switch (type) {
            case 'string':
                if (!value) {
                    writer.writeShort(0);
                } else {
                    writer.writeString(value as string);
                }
                break;
            case 'number':
                writer.writeInt(value as number);
                break;
            case 'boolean':
                writer.writeByte(value as boolean ? 1 : 0);
                break;
            default:
                writer.writeByte(0);
        }
    }
}
