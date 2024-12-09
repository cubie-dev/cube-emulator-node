export class Response {
    protected _data: unknown[];

    public constructor(
        protected _header: number
    ) {}

    public get header(): number {
        return this._header;
    }

    protected addData(data: unknown): void {
        this._data.push(data);
    }

    public get data(): unknown[] {
        return this._data;
    }
}
