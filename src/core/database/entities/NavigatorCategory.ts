import { defineEntity } from '@mikro-orm/core';
import { p } from '@mikro-orm/postgresql';
import { Room } from './Room';

const navigatorCategorySchema = defineEntity({
    name: 'NavigatorCategory',
    tableName: 'navigator_categories',
    properties: {
        id: p.integer()
            .primary()
            .fieldName('id'),
        name: p.text()
            .fieldName('name'),
        rooms: () => p.oneToMany(Room)
            .mappedBy(room => room.category),
    }
});

export class NavigatorCategory extends navigatorCategorySchema.class {}

navigatorCategorySchema.setClass(NavigatorCategory);
