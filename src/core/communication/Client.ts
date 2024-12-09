import { RawData, WebSocket } from 'ws';

export class Client {
    public constructor(
        private socket: WebSocket
    ) {
        // this.initEvents();
    }

    // private initEvents() {
    //     this.socket.on('message', this.onMessage.bind(this));
    //     this.socket.on('close', this.onClose.bind(this));
    // }

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
    private onClose() {}
}
