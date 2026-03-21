import { Entity, EntityRepositoryType, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { RoomRepository } from '../repositories/RoomRepository.js';
import { NavigatorCategory } from './NavigatorCategory.js';
import { User } from './User.js';

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
        fieldName: 'name',
        type: 'varchar',
    })
    public name!: string;

    @ManyToOne(
        () => User,
        {
            fieldName: 'owner_id',
        }
    )
    public owner: User;

    @ManyToOne(
        () => NavigatorCategory,
        {
            fieldName: 'category_id',
        }
    )
    public category: NavigatorCategory;
}
