import { Event } from '../../../core/communication/events/Event';
import { Response } from '../../../core/communication/responses/Response';

export interface ICodec {
    encode(response: Response): ArrayBuffer;
    decode(data: Buffer): Event;
}

export const CODEC_TOKEN = Symbol.for('ICodec');
