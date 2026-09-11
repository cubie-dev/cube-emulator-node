import { inject, injectable } from 'inversify';
import { type PipeClass, type Destination } from '../../support/pipeline/Pipeline';
import { CODEC_TOKEN, type ICodec } from '../../../api/core/communication/Codec';
import { type RawMessage, type DecodedMessage } from '../RawMessage';
import { type Composer } from '../composers/Composer.ts';

@injectable()
export class CodecPipe implements PipeClass<RawMessage, DecodedMessage, Composer | Composer[], ArrayBuffer[]> {
    public constructor(
        @inject(CODEC_TOKEN) private readonly codec: ICodec,
    ) {}

    public async handle(
        input: RawMessage,
        next: Destination<DecodedMessage, Composer | Composer[]>,
    ): Promise<ArrayBuffer[] | null> {
        const result = await next({
            client: input.client,
            event: this.codec.decode(input.data),
        });

        if (!result) {
            return null;
        }

        const responses = Array.isArray(result) ? result : [result];
        return responses.map(r => this.codec.encode(r));
    }
}
