import { Entity, EntityRepositoryType, Enum, OneToOne, PrimaryKey, Property, type Rel } from '@mikro-orm/core';
import {UserRepository} from '../repositories/UserRepository';
import { Gender } from '../enums/Gender';
import { UserStats } from './UserStats';

@Entity({
    tableName: 'users',
    repository: () => UserRepository,
})
export class User {
    [EntityRepositoryType]?: UserRepository;

    @PrimaryKey({ type: 'numeric' })
    public id: number;

    @Property({
        fieldName: 'username',
        type: 'varchar',
    })
    public username: string;

    @Property({
        fieldName: 'look',
        type: 'varchar',
    })
    public look: string;

    @Enum({
        fieldName: 'gender',
        items: () => Gender
    })
    public gender: Gender;

    @Property({
        fieldName: 'auth_token',
        type: 'text',
    })
    public authToken: string | null;

    @OneToOne(
        () => UserStats,
        (stats: UserStats) => stats.user,
    )
    public stats: Rel<UserStats>;
}
