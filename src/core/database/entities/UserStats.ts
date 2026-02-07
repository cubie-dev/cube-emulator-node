import { BooleanType, Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './User';

@Entity({ tableName: 'user_stats'})
export class UserStats {
    @PrimaryKey({
        fieldName: 'id',
        type: 'numeric',
    })
    public id!: number;

    @Property({
        fieldName: 'respect_received',
        type: 'numeric',
    })
    public respectReceived!: number;

    @OneToOne(
        () => User,
        (user: User) => user.stats,
        {
            fieldName: 'user_id',
            owner: true,
        }
    )
    public user!: User;
}
