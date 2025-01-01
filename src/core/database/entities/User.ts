import { Entity, Enum, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import {UserRepository} from '../repositories/UserRepository';
import { Gender } from '../enums/Gender';
import { UserSettings } from './UserSettings';

@Entity({
    tableName: 'users',
    repository: () => UserRepository,
})
export class User {
    @PrimaryKey({ type: 'numeric' })
    public id!: number;

    @Property({
        fieldName: 'auth_ticket',
        type: 'varchar',
    })
    public authTicket!: string;

    @Property({
        fieldName: 'username',
        type: 'varchar',
    })
    public username!: string;

    @Property({
        fieldName: 'look',
        type: 'varchar',
    })
    public look!: string;

    @Enum({
        fieldName: 'gender',
        items: () => Gender
    })
    public gender!: Gender;

    @Property({
        fieldName: 'motto',
        type: 'varchar',
    })
    public motto!: string;

    @Property({
        fieldName: 'real_name',
        type: 'string',
    })
    public realName!: string;

    @OneToOne(
        () => UserSettings,
        (settings: UserSettings) => settings.user,
        {
        }
    )
    public settings!: UserSettings;
}
