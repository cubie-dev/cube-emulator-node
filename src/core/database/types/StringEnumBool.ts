import { Type } from '@mikro-orm/core';

export class StringEnumBool extends Type<boolean, string> {
    public convertToDatabaseValue(value: boolean): string {
        return value ? '1' : '0';
    }

    public convertToJSValue(value: string): boolean {
        return value === '1';
    }

    public getColumnType(): string {
        return 'enum';
    }
}
