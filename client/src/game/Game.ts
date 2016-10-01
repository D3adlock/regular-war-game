/// <reference path="../../libs/phaser.d.ts" />
/// <reference path="states/StartScreen.ts" />
/// <reference path="states/Arena1.ts" />
/// <reference path="states/Boot.ts" />
/// <reference path="states/EnterName.ts" />
/// <reference path="states/TestStage.ts" />

module Rwg {

    export class Game extends Phaser.Game {

    	public ws: any;

        constructor(ws: any) {
            super(800, 600, Phaser.AUTO, 'canvas-area');
            
            this.ws = ws;

            // this.state.add('StartScreen', StartScreen, false);
            // this.state.add('Arena1', Arena1, false);
            this.state.add('TestStage', TestStage, false);
            this.state.add('Boot', Boot, false);
            this.state.add('EnterName', EnterName, false); 
            this.state.start('Boot');
        }
    }
}
