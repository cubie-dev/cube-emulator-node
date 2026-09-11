import type { ComposableData } from '../ComposableData.ts';

export class Composer {
    public readonly data: ComposableData[] = [];

    public constructor(
        protected _header: number
    ) {}

    public get header(): number {
        return this._header;
    }

    protected appendData(data: ComposableData): void {
        this.data.push(data);
    }
}
