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
        visible: p.boolean().default(true),
        automatic: p.boolean().default(false),
        automaticCategoryKey: p.text().fieldName('automatic_category_key').default(''),
        globalCategoryKey: p.text().fieldName('global_category_key').default(''),
        staffOnly: p.boolean().fieldName('staff_only').default(false),
        rooms: () => p.oneToMany(Room)
            .mappedBy(room => room.category),
    }
});

export class NavigatorCategory extends navigatorCategorySchema.class {}

navigatorCategorySchema.setClass(NavigatorCategory);
