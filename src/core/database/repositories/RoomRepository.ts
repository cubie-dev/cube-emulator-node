import { EntityRepository } from '@mikro-orm/core';
import { Room } from '../entities/Room';

export class RoomRepository extends EntityRepository<Room> {
    public async getPublicRooms(): Promise<Room[]> {
        return this.find({
            owner: null,
        })
    }
}
