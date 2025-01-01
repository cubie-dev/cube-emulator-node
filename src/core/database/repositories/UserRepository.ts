import { EntityRepository, Loaded } from '@mikro-orm/core';
import { User } from '../entities/User';

export class UserRepository extends EntityRepository<User> {
}
