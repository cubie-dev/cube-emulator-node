import { BooleanType, Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './User';

@Entity({ tableName: 'users_settings'})
export class UserSettings {
    @PrimaryKey({
        fieldName: 'id',
        type: 'numeric',
    })
    public id!: number;

    @Property({
        fieldName: 'respects_received',
        type: 'numeric',
    })
    public respectReceived!: number;

    @Property({
        fieldName: 'daily_respect_points',
        type: 'numeric',
    })
    public respectsToGiveToday!: number;

    @Property({
        fieldName: 'daily_pet_respect_points',
        type: 'numeric',
    })
    public petRespectsToGiveToday!: number;

    @Property({
        fieldName: 'allow_name_change',
        type: BooleanType,
    })
    public allowNameChange!: boolean;

    @OneToOne(
        () => User,
        (user: User) => user.settings,
        {
            fieldName: 'user_id',
            owner: true,
        }
    )
    public user!: User;
}
