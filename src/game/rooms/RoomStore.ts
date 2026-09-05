import type { IRoomStore } from '../../api/game/rooms/RoomStore.ts';
import type { Room as RoomEntity } from '../../core/database/entities/Room.ts';
import { Room } from './Room.ts';

export class RoomStore implements IRoomStore {
    private readonly rooms = new Map<number, Room>();

    public openRoom(roomEntity: RoomEntity): Room {
        const room = new Room(roomEntity);

        this.rooms.set(roomEntity.id, room);

        return room;
    }
}