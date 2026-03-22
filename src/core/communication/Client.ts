import { ServerWebSocket } from 'bun';
import { User } from '../database/entities/User';

export class Client {
    private _user: User;
    private _lastPong?: number;

    public constructor(
        public socket: ServerWebSocket<Client>
    ) {
    }

    public send(buffer: ArrayBuffer, errorCallback: (err?: Error) => void): void {
        const result = this.socket.send(buffer);
        errorCallback(result < 0 ? new Error('WebSocket send failed') : undefined);
    }

    public set user(user: User) {
        this._user = user;
    }

    public set lastPong(timestamp: number) {
        this._lastPong = timestamp;
    }
}
