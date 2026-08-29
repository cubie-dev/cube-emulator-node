import { defineEntity } from '@mikro-orm/core';
import { p } from '@mikro-orm/postgresql';
import { User } from './User';

const userStatsSchema = defineEntity({
    name: 'UserStats',
    tableName: 'user_stats',
    properties: {
        id: p.integer()
            .primary()
            .fieldName('id'),
        respectReceived: p.integer()
            .fieldName('respect_received'),
        user: () => p.oneToOne(User)
            .fieldName('user_id'),
    }
});

export class UserStats extends userStatsSchema.class {}

userStatsSchema.setClass(UserStats);
