import { BinaryReader } from '../BinaryReader.js';

export class Event {

    public constructor(
        private readonly messageLength: number,
        public readonly header: number,
        public readonly reader: BinaryReader
    ) {
    }
}
