import { EventHandler } from '../../EventHandler';
import type { EventContext } from '../../EventContext';
import { CompleteDiffieHandshakeComposer } from '../../../composers/handshake/CompleteDiffieHandshakeComposer.ts';

export class CompleteDiffieHandshakeHandler extends EventHandler {
    public handle(context: EventContext): CompleteDiffieHandshakeComposer | null {
        const { client } = context;

        if (!client.encryption) {
            return null;
        }

        const clientPublicKey = context.event.reader.readString();
        // Queue RC4 activation — applied after this response is sent (see Client.send)
        client.pendingSharedKey = client.encryption.dh.getSharedKey(clientPublicKey);

        return new CompleteDiffieHandshakeComposer(
            client.encryption.dh.getPublicKey(),
            true,
        );
    }
}
