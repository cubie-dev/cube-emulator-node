import { EntityRepository, type FilterQuery } from '@mikro-orm/core';
import { Room } from '../entities/Room';

export class RoomRepository extends EntityRepository<Room> {
    public async getPublicRoomsByCategory(): Promise<Room[]> {
        return this.find({
            owner: null,
        }, {
            populate: ['category']
        });
    }
}
