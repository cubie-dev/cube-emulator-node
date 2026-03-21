import { Response } from '../Response.js';
import { ResponseHeader } from '../ResponseHeader.js';
import { GameType } from '../../../../../game/GameType.js';

export class LoadGameUrlResponse extends Response {
    public constructor(
        gameType: GameType
    ) {
        super(ResponseHeader.LOAD_GAME_URL);

        // game type id, 2 is snowstorm, the rest is default
        this.addData(gameType);
        this.addData(0); // In case of snowtorm, game client id
        this.addData('') // in case of snowstorm the game URl
    }
}
