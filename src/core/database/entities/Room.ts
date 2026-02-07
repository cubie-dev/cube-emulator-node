import { Entity, EntityRepositoryType, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { RoomRepository } from '../repositories/RoomRepository';
import { StringEnumBool } from '../types/StringEnumBool';
import { NavigatorCategory } from './NavigatorCategory';

@Entity({
    tableName: 'rooms',
    repository: () => RoomRepository,
})
export class Room {
    [EntityRepositoryType]?: RoomRepository;

    @PrimaryKey({
        type: 'numeric'
    })
    public id!: number;

    @Property({
        type: StringEnumBool,
        fieldName: 'is_public',
    })
    public isPublic!: boolean;

    @ManyToOne(
        () => NavigatorCategory,
    )
    public category: NavigatorCategory;
}
