import { Composer } from '../Composer.ts';
import { ComposerHeader } from '../ComposerHeader.ts';
import { type Room } from '../../../database/entities/Room';
import { RoomComposable } from './RoomComposable.ts';

/**
 * @see nitro/communication/messages/parser/navigator/NavigatorSearchParser.ts
 */
export class NavigatorSearchComposer extends Composer {
    public constructor(
        contextCode: string,
        searchQuery: string,
        roomsPerCategory: Record<string, Room[]>
    ) {
        super(ComposerHeader.NAVIGATOR_SEARCH);

        this.appendData(contextCode);
        this.appendData(searchQuery);
        this.appendData(Object.keys(roomsPerCategory).length);

        for (const [category, rooms] of Object.entries(roomsPerCategory)) {
            this.appendData(category);
            this.appendData(''); // data
            this.appendData(1); // action
            this.appendData(false); // closed
            this.appendData(0); // mode
            this.appendData(rooms.length);

            for (const room of rooms) {
                this.appendData(new RoomComposable(room));
            }
        }
    }
}
