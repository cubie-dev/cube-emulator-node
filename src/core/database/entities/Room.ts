import { defineEntity } from '@mikro-orm/core';
import { RoomRepository } from '../repositories/RoomRepository';
import { NavigatorCategory } from './NavigatorCategory';
import { User } from './User';
import { TradeType } from '../enums/TradeType';
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
            .fieldName('owner_id'),
        isPublic: p.boolean().fieldName('is_public').default(false),
        category: () => p.manyToOne(NavigatorCategory)
            .fieldName('category_id'),
        maxUserCount: p.integer().fieldName('max_user_count').default(255),
        description: p.text().length(255).default(''),
        score: p.integer().default(0),
        ranking: p.integer().default(0),
        open: p.boolean().default(true),
        officialPictureRef: p.text().fieldName('official_picture_ref').nullable(),
        showOwner: p.boolean().fieldName('show_owner').default(true),
        allowPets: p.boolean().fieldName('allow_pets').default(true),
        adName: p.text().fieldName('ad_name').nullable(),
        adDescription: p.text().fieldName('ad_description').nullable(),
        adExpiresAt: p.datetime().fieldName('ad_expires_at').nullable(),
        tags: p.text().nullable(),
        model: p.text().default('model_a'),
        tradeType: p.enum(TradeType).fieldName('trade_type').default(TradeType.NOT_ALLOWED),
    }
})

export class Room extends roomSchema.class {}

roomSchema.setClass(Room);
