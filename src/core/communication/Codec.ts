import { Event } from './events/Event';
import { BinaryReader } from './BinaryReader';
import { Composer } from './composers/Composer.ts';
import { BinaryWriter } from './BinaryWriter';
import { type ICodec } from '../../api/core/communication/Codec';
import { isMapLike } from '../support/helpers/isMapLike';
import type { Primitive } from '../support/helpers/Primitive';
import { Composable } from './composers/Composable.ts';
import type { ComposableData } from './ComposableData.ts';

export type TypeOf = 'number'|'boolean'|'string'|'null'|'object'|'array'|'arraybuffer'|'map'|'composable';

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

        this.write(writer, data);

        const buffer = writer.getBuffer();

        return new BinaryWriter()
            .writeInt(buffer.byteLength)
            .writeBytes(buffer)
            .getBuffer();
    }

    private write(writer: BinaryWriter, items: ComposableData[]): void {
        for (const item of items) {
            let type = typeof item as TypeOf;

            if (type === 'object') {
                if (item === null) {
                    type = 'null';
                } else if (item instanceof Composable) {
                    type = 'composable';
                }
                else if (item instanceof ArrayBuffer) {
                    type = 'arraybuffer';
                } else if (Array.isArray(item)) {
                    type = 'array';
                } else if (isMapLike(item)) {
                    type = 'map';
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

                    this.write(writer, item as ComposableData[]);
                    break;
                case 'map':
                    const entries = Object.entries(item as Record<string | number, unknown>);
                    writer.writeInt(entries.length);
                    for (const [key, value] of entries) {
                        this.writePrimitive(writer, key);
                        this.writePrimitive(writer, value as Primitive);
                    }
                    break;
                case 'composable':
                    this.write(writer, (item as Composable).getData());
                    break;
                default:
                    writer.writeByte(0);
                    break;
            }
        }
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
