import { EventHandler } from '../../EventHandler';
import type { EventContext } from '../../EventContext';
import { CompleteDiffieHandshakeResponse } from '../../../responses/handshake/CompleteDiffieHandshakeResponse';

export class CompleteDiffieHandshakeEvent extends EventHandler {
    public handle(context: EventContext): CompleteDiffieHandshakeResponse|null {
        const { client } = context;

        if (!client.encryption) {
            return null;
        }

        const clientPublicKey = context.event.reader.readString();
        // Queue RC4 activation — applied after this response is sent (see Client.send)
        client.pendingSharedKey = client.encryption.dh.getSharedKey(clientPublicKey);

        return new CompleteDiffieHandshakeResponse(
            client.encryption.dh.getPublicKey(),
            true,
        );
    }
}
