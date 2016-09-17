/// <reference path="../../libs/phaser.d.ts" />
/// <reference path="states/StartScreen.ts" />
/// <reference path="states/Arena1.ts" />
/// <reference path="players/UserPlayer.ts" />
/// <reference path="players/PlayerGroup.ts" />

module Rwg {

    export class Game extends Phaser.Game {

    	public ws: any;

        public userPlayer: UserPlayer;
        public foePlayers: PlayerGroup;
        public allyPlayers: PlayerGroup;

        constructor(ws: any) {
            super(800, 600, Phaser.AUTO, 'canvas-area');
            
            this.ws = ws;

            this.state.add('StartScreen', StartScreen, false);
            this.state.add('Arena1', Arena1, false);
            
            this.state.start('StartScreen');
        }
    }
}
