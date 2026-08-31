export class Response {
    public readonly data: unknown[] = [];

    public constructor(
        protected _header: number
    ) {}

    public get header(): number {
        return this._header;
    }

    protected addData(data: unknown): void {
        this.data.push(data);
    }
}
