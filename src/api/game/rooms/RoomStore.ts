import type { Room as RoomEntity } from '../../../core/database/entities/Room.ts';
import { Room } from '../../../game/rooms/Room.ts';

export interface IRoomStore {
    openRoom(roomEntity: RoomEntity): Room;
}

export const ROOM_STORE_TOKEN = Symbol.for('IRoomStore');
