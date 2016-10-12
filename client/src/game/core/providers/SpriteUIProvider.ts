/// <reference path="../super/BaseChar.ts" />

module Rwg {

    export class SpriteUIProvider {

        public provide(game: Phaser.Game, character: BaseChar) {

            character.spriteUi = game.add.group();

            // creates the sprite UI only for other players
            if (game.state.getCurrentState().player) {
                this.provideMiniHealthBar(game, character);
                this.provideCharLabel(game, character);
            }

            // manual anchor implementation for the group
            character.spriteUi.anchor = {};
            character.spriteUi.anchor.x = 0;
            character.spriteUi.anchor.y = -((character.height / 2) + 15);

            let plus = 0;
            if ((character.width / 2) != 25) {
                plus = 25 - (character.width / 2);
            }
            character.spriteUi.anchor.x = -((character.width / 2) + plus);

            // updates the position of the ui every time the sprites updates
            character.updateMethods['SpriteUIFixPosition'] = function() {
                this.spriteUi.position.y = this.y + this.spriteUi.anchor.y;
                this.spriteUi.position.x = this.x + this.spriteUi.anchor.x; 
            }.bind(character);
            character.spriteUi.visible = true;

            character.events.onDestroy.add(function() {
                this.spriteUi.destroy();
            },character)
        }

        private public provideMiniHealthBar(game: Phaser.Game, character: BaseChar) {

            // mini life bar
            let miniLifeBarFrame = game.add.graphics(0,0);
            miniLifeBarFrame.beginFill(0x000000);
            miniLifeBarFrame.drawRect(0, 0, 50, 4);

            let miniLifeBarHealth = game.add.graphics(1,1);
            if (game.state.getCurrentState().player.team == character.team) {
                miniLifeBarHealth.beginFill(0x00ff00);
            } else {
                miniLifeBarHealth.beginFill(0xff0000);
            }
            miniLifeBarHealth.drawRect(0, 0, 48, 2);
            miniLifeBarHealth.currentHP = -1;


            character.spriteUi.add(miniLifeBarFrame);
            character.spriteUi.add(miniLifeBarHealth);

            character.updateMethods['changeInMiniLifeBar'] = function() {
                if (miniLifeBarHealth.currentHP != this.currentHP) {
                    let width = (this.currentHP*48)/this.maxHP;
                    miniLifeBarHealth.width = width;
                }
            }.bind(character);
        }

        private public provideCharLabel(game: Phaser.Game, character: BaseChar) {
            // title
            let label = game.add.text(0,-8,character.name,{font:"bold 12px Arial",fill:"#ffffff",boundsAlignH: "center", boundsAlignV: "middle"});
            label.stroke = '#000000';
            label.strokeThickness = 4;

            label.setTextBounds(0, 0, character.spriteUi.width, character.spriteUi.height);
            character.spriteUi.add(label);
        }
    }
}
