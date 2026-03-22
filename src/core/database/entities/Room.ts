import { defineEntity } from '@mikro-orm/core';
import { RoomRepository } from '../repositories/RoomRepository';
import { NavigatorCategory } from './NavigatorCategory';
import { User } from './User';
import { p } from '@mikro-orm/postgresql';

const roomSchema = defineEntity({
    name: 'Room',
    tableName: 'rooms',
    repository: () => RoomRepository,
    properties: {
        id: p.integer()
            .primary(),
        name: p.text(),
        owner: p.manyToOne(User)
            .fieldName('owner_id')
            .owner(),
        category: () => p.manyToOne(NavigatorCategory)
            .fieldName('category_id')
            .owner(),
    }
})

export class Room extends roomSchema.class {}

roomSchema.setClass(Room);
