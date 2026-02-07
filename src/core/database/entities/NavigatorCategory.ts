import { BooleanType, Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Room } from './Room';
import { StringEnumBool } from '../types/StringEnumBool';

@Entity({
    tableName: 'navigator_flatcats',
})
export class NavigatorCategory {
    @PrimaryKey({
        fieldName: 'id',
        type: 'numeric'
    })
    public id!: number;

    @Property({
        fieldName: 'min_rank',
        type: 'numeric',
    })
    public minRank!: number;

    @Property({
        fieldName: 'caption',
        type: 'string',
    })
    public caption!: string;

    @Property({
        fieldName: 'daily_respect_points',
        type: BooleanType,
    })
    public canTrade!: number; // TODO this is actualy a enum with strings in the database

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
