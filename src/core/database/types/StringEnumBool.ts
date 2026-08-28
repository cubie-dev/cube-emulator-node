import { Type } from '@mikro-orm/core';

export class StringEnumBool extends Type<boolean, string> {
    public override convertToDatabaseValue(value: boolean): string {
        return value ? '1' : '0';
    }

    public override convertToJSValue(value: string): boolean {
        return value === '1';
    }

    public override getColumnType(): string {
        return 'enum';
    }
}
