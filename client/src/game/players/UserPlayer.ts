/// <reference path="Player.ts" />

module Rwg {

    export class UserPlayer extends Player {

        private speed: number;
        private controlEnable: boolean;

        public hitPoints: number;
        public score: number;

        private hipointsDisplay: any;
        private scoreDisplay: any;
        public uiMask: any;

        constructor(game: Phaser.Game, x: number, y: number) {
            super(game, x, y);
            this.hits = 0;
            this.hitPoints = 50;
            this.score = 0;
            this.controlEnable = true;

            // super important for hit detection
            this.game.physics.arcade.enable(this);
            this.body.collideWorldBounds=true;

            // add update methods for controll th  player character
            delete this.updateMethods['hitTheUserPlayer'];

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
        }

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
            this.updatesPosition(80,80);
            // restore the player hitpoints
            this.hitPoints = 50;
        }

        public addAKill() {
            this.score++;
            this.scoreDisplay.text = 'Score : ' + this.score;
        }
    }
}
