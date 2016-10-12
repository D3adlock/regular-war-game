/// <reference path="../../libs/phaser.d.ts" />
/// <reference path="states/Boot.ts" />
/// <reference path="states/EnterName.ts" />
/// <reference path="states/CharSelection.ts" />
/// <reference path="states/ArenaSelection.ts" />
/// <reference path="states/GameOver.ts" />

/// <reference path="arenas/ForestTown.ts" />

module Rwg {

    export class Game extends Phaser.Game {

    	public ws: any;

        constructor(ws: any) {
            super(800, 600, Phaser.AUTO, 'canvas-area');
            
            this.ws = ws;

            // flow
            this.state.add('Boot', Boot, false);
            this.state.add('EnterName', EnterName, false); 
            this.state.add('CharSelection', CharSelection, false); 
            this.state.add('ArenaSelection', ArenaSelection, false); 
            this.state.add('GameOver', GameOver, false); 

            //arenas
            this.state.add('ForestTown', ForestTown, false); 
            
            this.state.start('Boot');
        }
    }
}
