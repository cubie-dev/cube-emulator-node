import { type Socket } from 'bun';
import { type User } from '../database/entities/User';
import type { HabboEncryption } from '../crypto/HabboEncryption';
import { HabboRC4 } from '../crypto/HabboRC4';

export class Client {
    private _user?: User;
    private _lastPong?: number;
    private _buffer: Buffer = Buffer.alloc(0);
    private _rc4Decrypt?: HabboRC4;
    private _rc4Encrypt?: HabboRC4;

    public encryption?: HabboEncryption;
    public pendingSharedKey?: Uint8Array;

    public constructor(
        public socket: Socket<Client>
    ) {
    }

    public appendData(chunk: Buffer): Buffer[] {
        if (this._rc4Decrypt) this._rc4Decrypt.parse(chunk);

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
        const data = Buffer.from(buffer);
        if (this._rc4Encrypt) this._rc4Encrypt.parse(data);

        const written = this.socket.write(data.buffer);

        if (this.pendingSharedKey) {
            this._rc4Decrypt = new HabboRC4(this.pendingSharedKey);
            this._rc4Encrypt = new HabboRC4(this.pendingSharedKey);
            this.pendingSharedKey = undefined;
        }

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
