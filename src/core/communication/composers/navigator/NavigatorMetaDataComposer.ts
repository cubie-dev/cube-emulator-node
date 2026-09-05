import { Composer } from '../Composer.ts';
import { ComposerHeader } from '../ComposerHeader.ts';

export class NavigatorMetaDataComposer extends Composer {
    public constructor() {
        super(ComposerHeader.NAVIGATOR_METADATA);

        this.appendData(4);
        this.appendData('official_view');
        this.appendData(0);
        this.appendData('hotel_view');
        this.appendData(0);
        this.appendData('roomads_view');
        this.appendData(0);
        this.appendData('myworld_view');
        this.appendData(0);
    }
}
