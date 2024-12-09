import { BinaryReader } from '../BinaryReader';

export class Event {

    public constructor(
        private _messageLength: number,
        private _header: number,
        private _reader: BinaryReader
    ) {
    }

    public get header(): number {
        return this._header;
    }

    public get reader(): BinaryReader {
        return this._reader;
    }
}
