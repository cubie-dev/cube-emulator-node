import { BooleanType, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Room } from './Room.js';
import { StringEnumBool } from '../types/StringEnumBool.js';

@Entity({
    tableName: 'navigator_categories',
})
export class NavigatorCategory {
    @PrimaryKey({
        fieldName: 'id',
        type: 'numeric'
    })
    public id!: number;

    @Property({
        fieldName: 'name',
        type: 'string',
    })
    public name!: string;

    @OneToMany(
        () => Room,
        (room: Room) => room.category,
    )
    public rooms: Collection<Room>;

    @Property({
        fieldName: 'public',
        type: StringEnumBool,
    })
    public isPublic!: boolean;
}
