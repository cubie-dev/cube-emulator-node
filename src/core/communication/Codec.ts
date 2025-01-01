import { Event } from './messages/events/Event';
import { BinaryReader } from './messages/BinaryReader';
import { Response } from './messages/responses/Response';
import { BinaryWriter } from './messages/BinaryWriter';
import { injectable } from 'inversify';
import { ICodec } from '../../api/core/communication/Codec';

@injectable()
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
        )
    }

    public encode(response: Response): ArrayBuffer {
        const data = response.data;
        const writer = new BinaryWriter();

        writer.writeShort(response.header);

        for (const item of data) {
            let type: string = typeof item;

            if(type === 'object')
            {
                if (item === null) {
                    type = 'null';
                }
                // else if(item instanceof Byte) type = 'byte';
                // else if(item instanceof Short) type = 'short';
                else if (item instanceof ArrayBuffer) {
                    type = 'arraybuffer';
                }
            }

            switch (type) {
                case 'string':
                    if(!item) {
                        writer.writeShort(0);
                    } else {
                        writer.writeString(item as string, true);
                    }
                    break;
                case 'number':
                    writer.writeInt(item as number);
                    break;
                case 'boolean':
                    writer.writeByte(item as boolean ? 1 : 0);
                    break;
                case 'arraybuffer':
                    writer.writeBytes(item as ArrayBuffer);
                    break;
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
}
