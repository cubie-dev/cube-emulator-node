import { defineEntity } from '@mikro-orm/core';
import {UserRepository} from '../repositories/UserRepository';
import { Gender } from '../enums/Gender';
import { UserStats } from './UserStats';
import { p } from '@mikro-orm/postgresql';

const userSchema = defineEntity({
    name: 'User',
    tableName: 'users',
    repository: () => UserRepository,
    properties: {
        id: p.integer()
            .primary()
            .fieldName('id'),
        username: p.text()
            .fieldName('username'),
        look: p.text()
            .fieldName('look'),
        gender: p.enum(() => Gender)
            .fieldName('gender'),
        authToken: p.text()
            .nullable()
            .fieldName('auth_token'),
        stats: () => p.oneToOne(UserStats)
            .mappedBy(stats => stats.user)
    }
});

export class User extends userSchema.class {}

userSchema.setClass(User);
