import { type Socket } from 'bun';
import { type User } from '../database/entities/User';

export class Client {
    private _user?: User;
    private _lastPong?: number;
    private _buffer: Buffer = Buffer.alloc(0);

    public constructor(
        public socket: Socket<Client>
    ) {
    }

    /**
     * Accumulates incoming TCP bytes and returns every complete message found.
     * Each message is [4-byte length][header+payload], where the length field
     * counts the bytes that follow it (same layout the Codec already expects).
     */
    public appendData(chunk: Buffer): Buffer[] {
        this._buffer = Buffer.concat([this._buffer, chunk]);

        const messages: Buffer[] = [];

        while (this._buffer.length >= 4) {
            const messageLength = this._buffer.readInt32BE(0);
            const totalLength = 4 + messageLength;

            if (this._buffer.length < totalLength) break;

            messages.push(this._buffer.subarray(0, totalLength));
            this._buffer = this._buffer.subarray(totalLength);
        }

        return messages;
    }

    public send(buffer: ArrayBuffer, errorCallback: (err?: Error) => void): void {
        const written = this.socket.write(buffer);
        errorCallback(written < 0 ? new Error('TCP send failed') : undefined);
    }

    public get user(): User | undefined {
        return this._user;
    }

    public set user(user: User) {
        this._user = user;
    }

    public set lastPong(timestamp: number) {
        this._lastPong = timestamp;
    }
}
