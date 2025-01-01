import { Event } from '../../../core/communication/messages/events/Event';
import { Response } from '../../../core/communication/messages/responses/Response';

export interface ICodec {
    encode(response: Response): ArrayBuffer;
    decode(data: Buffer): Event;
}

export const CODEC_TOKEN = Symbol.for('ICodec');
