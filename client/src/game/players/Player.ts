module Rwg {

    export class Player extends Phaser.Sprite {

        private playerNameLabel:any;
        private color:string;
        public playerId:string;
        public team: number;

        public fightType: string;
        private weapon:any;

        public FacePositions: any;
        public updateMethods: any;

        // properties that make sence only for the userPlayer
        public keyDownInputMethods: any;
        public keyUpInputMethods: any;
        private keyStack: any;

        constructor(game: Phaser.Game, x: number, y: number) {
            super(game, x, y, 'swordFighter');

            // initializing the object
            this.anchor.setTo(0.5, 0.5);
            this.scale.setTo(1.5, 1.5);
            this.game.add.existing(this);
            this.weapon = this.game.add.physicsGroup();
            this.createWalkAnimations();
            this.FacePositions = {LEFT:1,RIGHT:2,UP:3,DOWN:4}
            // playerlabelname
            var style = { font: "16px Arial", fill: "#ffffff", wordWrap: true, align: "center"};
            this.playerNameLabel = this.game.add.text(x, y, '', style);
            this.playerNameLabel.anchor.set(0.5,2.3);
            this.playerNameLabel.position = this.position;

            //methods ment to be run in the update() code block
            this.updateMethods = {}
            this.updateMethods['hitTheUserPlayer'] = function() {
                this.game.physics.arcade.overlap(this.weapon, this.game.userPlayer, this.hitUserPlayer, this.userPlayerIsInMyTeam, this);
            }.bind(this);
            this.updateMethods['hitAFoePlayer'] = function() {
                this.game.physics.arcade.overlap(this.weapon, this.game.foePlayers, this.hitAFoe, this.hitMyselfCheck, this);
            }.bind(this);

            // hash of methods that are meant to run when keyboard is up or down
            this.keyDownInputMethods = {};
            this.keyUpInputMethods = {};
            this.keyStack = [];
        }

        /*
         *
         * DINAMIC CALLBACKS METHODS
         *
         */

        update() {
            for (var key in this.updateMethods) {
                this.updateMethods[key]();
            }
        }
        private keyDownCallBack(event){
            for (var key in this.keyDownInputMethods) {
                this.keyDownInputMethods[key](event);
            }
        }
        private keyUpCallBack(event){
            for (var key in this.keyUpInputMethods) {
                this.keyUpInputMethods[key](event);
            }
        }

        /*
         *
         * GENERIC PLAYER METHODS
         *
         */

        public updatePlayerPosition(x: number, y: number) {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.x = x;
            this.y = y;
            this.animations.stop('rightWalkAnimation', this.frame);
            this.animations.stop('leftWalkAnimation', this.frame);
            this.animations.stop('downWalkAnimation', this.frame);
            this.animations.stop('upWalkAnimation', this.frame);
        }

        private updatePlayerVelocity(velocityX:number, velocityY:number, x:number, y:number) {
            this.x = x;
            this.y = y;
            this.body.velocity.x = velocityX;
            this.body.velocity.y = velocityY;
            this.startWalkAnimationBaseOnVelocity();
        }

        public destroyPlayer() {
            this.playerNameLabel.destroy();
            this.destroy();
        }

        public setColor(color:string) {
            this.color = color;
            this.tint = color;
        }

        public setPlayerId(playerId:string) {
            this.playerId = playerId;
            this.playerNameLabel.text = 'Team-' + this.team + ': ' + playerId;
        }

        private hitMyselfCheck(weaponFromColision: any, foePlayer: any) {
            return this.playerId != foePlayer.playerId;
        }

        private userPlayerIsInMyTeam(userPlayer: any, weaponFromColision: any) {
            return this.team != userPlayer.team;
        }

        /*
         *
         *  SPRITE ANIMATION METHODS
         *
         */

        private createWalkAnimations() {
            let rightWalkAnimation = this.animations.add('rightWalkAnimation', [8,9,10,11], 15, true);
            let leftWalkAnimation = this.animations.add('leftWalkAnimation', [4,5,6,7], 15, true);
            let downWalkAnimation = this.animations.add('downWalkAnimation', [0,1,2,3], 15, true);
            let upWalkAnimation = this.animations.add('upWalkAnimation', [12,13,14,15], 15, true);
        }

        private startWalkAnimationBaseOnVelocity(){
            switch(this.getFacingBaseOnVelocity()) {
                case this.FacePositions.RIGHT:
                    this.play('rightWalkAnimation');
                    break;
                case this.FacePositions.LEFT:
                    this.play('leftWalkAnimation');
                    break;
                case this.FacePositions.UP:
                    this.play('upWalkAnimation');
                    break;
                case this.FacePositions.DOWN:
                    this.play('downWalkAnimation');
            }
        }

        private getFacingBaseOnVelocity() {
            if (this.body.velocity.x > 0) {
                return this.FacePositions.RIGHT;
            } else if(this.body.velocity.x < 0) {
                return this.FacePositions.LEFT;
            } else if(this.body.velocity.y > 0) {
                return this.FacePositions.DOWN;
            } else if(this.body.velocity.y < 0) {
                return this.FacePositions.UP;
            }
        }

        private changeSightPositionToPoint(x:number, y:number){

            switch(this.getSightPositionToPoint(x,y)) {
                case this.FacePositions.RIGHT:
                    this.frame = 8;
                    break;
                case this.FacePositions.LEFT:
                    this.frame = 4;
                    break;
                case this.FacePositions.UP:
                    this.frame = 12;
                    break;
                case this.FacePositions.DOWN:
                    this.frame = 0;
            }
        }

        private getSightPositionToPoint(x: number, y: number) {
            let horizontalDiff = x - this.x;
            let verticalDiff = y - this.y;

            if (horizontalDiff > 0 && Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
                return this.FacePositions.RIGHT;
            } else if(horizontalDiff < 0 && Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
                return this.FacePositions.LEFT;
            } else if(verticalDiff > 0 && Math.abs(horizontalDiff) < Math.abs(verticalDiff)) {
                return this.FacePositions.DOWN;
            } else if(verticalDiff < 0 && Math.abs(horizontalDiff) < Math.abs(verticalDiff)) {
                return this.FacePositions.UP;
            } else if (horizontalDiff > 0 && Math.abs(horizontalDiff) == Math.abs(verticalDiff)) {
                return this.FacePositions.RIGHT;
            } else if(horizontalDiff < 0 && Math.abs(horizontalDiff) == Math.abs(verticalDiff)) {
                return this.FacePositions.LEFT;
            }
        }

        /*
         * NULL METHODS FOR FILLING
         */

        private stopMovement(x: number, y: number){
            this.x = x;
            this.y = y;
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.MovemenrtControlEnable = false;
        }

        private continueMovement(){
            this.MovemenrtControlEnable = true;
            if (this.keyStack.length != 0) {
                this.setVelocityForKey(this.keyStack[this.keyStack.length-1]);
            }
        }
    }
}
