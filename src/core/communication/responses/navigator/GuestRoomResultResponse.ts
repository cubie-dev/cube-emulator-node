import { Response } from '../Response';

export class GuestRoomResultResponse extends Response {
    public constructor() {
        super();

        this.addData(true); //roomEnter
        this.addData(false); //roomForward
        this.addData(); //like navgitator, with bit masks and stuff
        this.addData(false); // staff pick
        this.addData(false); // is group member

        // moderation
        this.addData(true); // allow mute
        this.addData(true); // allow kick
        this.addData(true); // allow ban

        //chat
        this.addData(0); // mode
        this.addData(1); // weight
        this.addData(1); // speed
        this.addData(1); // protection

        this.addData(true); // opening connection
    }


}