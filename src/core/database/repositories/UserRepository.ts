import { EntityRepository } from '@mikro-orm/core';
import { User } from '../entities/User.js';

export class UserRepository extends EntityRepository<User> {
}
