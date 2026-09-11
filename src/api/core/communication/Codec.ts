import { Event } from '../../../core/communication/events/Event';
import { Composer } from '../../../core/communication/composers/Composer.ts';

export interface ICodec {
    encode(response: Composer): ArrayBuffer;
    decode(data: Buffer): Event;
}

export const CODEC_TOKEN = Symbol.for('ICodec');
