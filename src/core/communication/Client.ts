import { RawData, WebSocket } from 'ws';
import { User } from '../database/entities/User.js';

export class Client {
    private _user: User;
    private _lastPong?: number;

    public constructor(
        public socket: WebSocket
    ) {
    }

    public onMessage(cb: (client: this, data: Buffer) => void) {
        const that = this;
        this.socket.on(
            'message',
            (data: RawData) => cb(that, data as Buffer)
        )
    }

    public send(buffer: ArrayBuffer, errorCallback: (err?: Error) => void): void {
        this.socket.send(buffer, errorCallback);
    }

    public set user(user: User) {
        this._user = user;
    }

    public set lastPong(timestamp: number) {
        this._lastPong = timestamp;
    }

    private onClose() {}
}
