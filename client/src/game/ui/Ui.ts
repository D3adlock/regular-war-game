/// <reference path="SkillContainer.ts" />
/// <reference path="LeaderBoard.ts" />

module Rwg {

    export class Ui {

        public ui:any;
        private skillContainer:any;
        public leaderBoard:LeaderBoard;

    	constructor(game:any, initPlayersScore:any) {

            this.game = game;
    		this.ui = this.game.add.group();
            this.ui.fixedToCamera = true;
            this.skillContainer = this.ui.addChild(new SkillContainer(game).skillContainer);

            this.leaderBoard = new LeaderBoard(game, initPlayersScore);
            this.ui.addChild(this.leaderBoard.board);

            this.createHealthBars();
        }

        private createHealthBars() {
            this.ui.create(20, 10, 'uiAtlas', 'hartIcon.png');

            // HP BAR
            let hpBarContent = this.game.add.tileSprite(63, 8, 325, 11, 'uiAtlas', 'hp.png');
            this.ui.addChild(hpBarContent);

            let hpBar = this.ui.create(60, 5, 'uiAtlas', 'emptyBar.png');
            this.game.world.bringToTop(hpBar);
            hpBar.currentHP = -1;

            let state = this.game.state.getCurrentState();
            state.player.updateMethods['updateLifeBar'] = function() {
                if (hpBar.currentHP != this.currentHP) {
                    let width = (this.currentHP*327)/this.maxHP;
                    hpBarContent.width = width;
                    hpBar.currentHP = this.currentHP;
                }
            }.bind(state.player);

            // MP BAR
            let mpBarContent = this.game.add.tileSprite(63, 28, 325, 11, 'uiAtlas', 'mp.png');
            this.ui.addChild(mpBarContent);
            let mpBar = this.ui.create(60, 25, 'uiAtlas', 'emptyBar.png');
        }
    }
}