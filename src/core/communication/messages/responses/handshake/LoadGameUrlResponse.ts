import { Response } from '../Response';
import { ResponseHeader } from '../ResponseHeader';
import { GameType } from '../../../../../game/GameType';

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
