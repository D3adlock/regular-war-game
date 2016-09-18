/// <reference path="Player.ts" />

module Rwg {

    export class UserPlayer extends Player {

        public hitPoints: number;
        public score: number;

        private hipointsDisplay: any;
        private scoreDisplay: any;
        public uiMask: any;

        public targetOver: any;
        public maxTargetsSelected: number;

        constructor(game: Phaser.Game, x: number, y: number) {
            super(game, x, y);
            this.hits = 0;
            this.hitPoints = 50;
            this.score = 0;

            // super important for hit detection
            this.game.physics.arcade.enable(this);
            this.body.collideWorldBounds=true;

            // delete this updateMethod wince it is not requiered for the userPlayer
            delete this.updateMethods['hitTheUserPlayer'];
            // update method only for user player
            this.updateMethods['leftClickAttack'] = function() {
                if (this.game.input.activePointer.leftButton.isDown && this.currentLeftClickAction != null) {
                    this.currentLeftClickAction();
                }
            }.bind(this);  

            // skills target mechanics
            this.targetsOver = [];
            this.maxTargetsSelected = 3;
            game.input.keyboard.removeKeyCapture([Phaser.KeyCode.ESC]);
            let esc = game.input.keyboard.addKey(Phaser.KeyCode.ESC);
            esc.onDown.add(this.releaseTarget, this);

            // UI display
            this.uiMask = this.game.add.graphics(0, 0);
            this.uiMask.beginFill(0x000000);
            this.uiMask.drawRect(0, 0, 800, 60);
            this.uiMask.fixedToCamera = true;

            var style = { font: "16px Arial", fill: "#ffffff", align: "center"};
            this.hipointsDisplay = this.game.add.text(50, 10, 'HP : ' + this.hitPoints, style);
            this.scoreDisplay = this.game.add.text(450, 10, 'Score : ' + this.score, style);

            this.uiMask.addChild(this.hipointsDisplay);
            this.uiMask.addChild(this.scoreDisplay);

            // enables the keyboard inputs for the user player
            this.game.input.keyboard.addCallbacks(this, this.keyDownCallBack, this.keyUpCallBack, null);
        }

        // skills mechanics for player
        private targetOver(player) {
            if (this.targetEnabled && this.targetsOver.length < this.maxTargetsSelected) {
                this.targetsOver.push(player);
                player.targetElipse.visible = true;
            }
        }
        private releaseTarget(player) {
            for (let i = 0; i < this.targetsOver.length; i++) {
                this.targetsOver[i].targetElipse.visible = false;
            }
            this.targetsOver = [];
            this.targetEnabled = false;
            this.attackControlsEnabled = true;
        }
        private addTargetable(newPlayer:any) {
            newPlayer.events.onInputOver.add(this.targetOver, this);
            newPlayer.inputEnabled = true;
        }

        // player life checkers
        public takeHit(damage: number, playerId: string) {
            this.hitPoints -= damage;
            if (this.hitPoints <= 0) {
                   this.sendPlayerKill(playerId);
            }

            this.hipointsDisplay.text = 'HP : ' + this.hitPoints;
        }
        private sendPlayerKill(playerId) {
            this.game.ws.send(
            {
                killedPlayer: this.playerId,
                killedBy: playerId,
                type: 'playerKilled'
            });
            this.sendUpdatePlayerPosition(80,80);
            // restore the player hitpoints
            this.hitPoints = 50;
        }
        public addAKill() {
            this.score++;
            this.scoreDisplay.text = 'Score : ' + this.score;
        }
    }
}
