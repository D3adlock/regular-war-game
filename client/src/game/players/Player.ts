/// <reference path="../ui/MiniLifeBar.ts" />

module Rwg {

    export class Player extends Phaser.Sprite {

        public playerNameLabel:any;
        public playerId:string;
        public team:number;
        private activeAttack:any;
        private skills: any;
        public skillSlots: any;
        private attacks: any;
        public updateMethods: any;
        public FacePositionsValues: any;

        public fightType: string;

        constructor(game: Phaser.Game, x: number, y: number) {
            super(game, x, y, 'link');
            this.frameName = 'standDown.png';
            this.anchor.setTo(0.5, 0.5);
            this.scale.setTo(2, 2);
            this.game.add.existing(this);

            // init attack and skill sets
            this.activeAttack = this.game.add.physicsGroup();
            this.skills = {};
            this.attacks = {};
            this.skillSlots = {};

            // update methods for checking hits
            this.updateMethods = {}
            this.updateMethods['hitTheUserPlayer'] = function() {
                this.game.physics.arcade.overlap(this.activeAttack, this.game.userPlayer, this.hitUserPlayer, this.userPlayerIsInMyTeam, this);
            }.bind(this);
            this.updateMethods['hitAFoePlayer'] = function() {
                this.game.physics.arcade.overlap(this.activeAttack, this.game.foePlayers, this.hitAFoe, this.hitMyselfCheck, this);
            }.bind(this);
            // this.updateMethods['mapLimits'] = function() {
            //     if(this.y < 150) {
            //         this.y  = 150;
            //     }
            // }.bind(this);

            /*
             * stetic stuff
             */

            this.createWalkAnimations();
            this.FacePositions = {LEFT:1,RIGHT:2,UP:3,DOWN:4}

            // methods for drawing the target circle in the player
            this.target = this.game.add.sprite(this.x, this.y, 'target');
            this.target.position = this.position;
            this.target.visible = false;
            this.target.anchor.set(0.5,0.5);
        }

        update() {
            for (var key in this.updateMethods) {
                this.updateMethods[key]();
            }
        }

        /*
         *
         * GENERIC PLAYER METHODS
         *
         */

        public recieveDamage(message) {
            this.miniLifeBar.updateLifeBar(message.maxHp, message.hp);
        } 

        public updatePlayerPosition(x: number, y: number, hp:number, maxHp:number) {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.x = x;
            this.y = y;
            this.animations.stop('rightWalkAnimation', this.frame);
            this.animations.stop('leftWalkAnimation', this.frame);
            this.animations.stop('downWalkAnimation', this.frame);
            this.animations.stop('upWalkAnimation', this.frame);
        }

        private updatePlayerVelocity(velocityX:number, velocityY:number, x:number, y:number, hp:number, maxHp:number) {
            this.x = x;
            this.y = y;
            this.body.velocity.x = velocityX;
            this.body.velocity.y = velocityY;
            this.startWalkAnimationBaseOnVelocity();
        }

        public destroyPlayer() {
            this.playerNameLabel.destroy();
            this.destroy();
            this.miniLifeBar.mark.destroy();
        }

        private stopMovement() {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.MovemenrtControlEnable = false;
        }

        /*
         *
         *  SETTERS
         *
         */

        public setColor(color:string) {
            this.color = color;
            this.tint = color;
        }

        public setPlayerId(playerId:string) {
            this.playerId = playerId;
            var style = { font: "16px Arial", fill: "#ffffff", wordWrap: true, align: "center"};
            this.playerNameLabel = this.game.add.text(0, 0, 'Team-' + this.team + ': ' + playerId, style);
            this.playerNameLabel.anchor.set(0.5,1.4);
            this.playerNameLabel.position = this.position;
        }

        public setMiniLifeBar(ally:boolean) {
            // minilife bar
            this.miniLifeBar = new MiniLifeBar(this.game, ally);
            this.miniLifeBar.setPosition(this.position);
        }

        /*
         *
         *  HIT DETECTION METHODS
         *
         */

        private hitUserPlayer(userPlayer, hitArea) {
            userPlayer.takeHit(this.attacks[hitArea.attackName].damage, this.playerId);
            if (this.attacks[hitArea.attackName].additionalEffect != null) {
                this.attacks[hitArea.attackName].additionalEffect(userPlayer);
            }
            hitArea.kill();
        }

        private hitAFoe(hitArea, foePlayer) {
            hitArea.kill();
        }

        private hitMyselfCheck(myAttack: any, attackedPlayer: any) {
            return this.playerId != attackedPlayer.playerId;
        }

        private userPlayerIsInMyTeam(userPlayer: any, myAttack: any) {
            return (this.team != userPlayer.team);
        }

        /*
         *
         *  SPRITE ANIMATION METHODS
         *
         */

        private createWalkAnimations() {
            let rightWalkFrames = [];
            let leftWalkFrames = [];
            let upWalkFrames = [];
            let downWalkFrames = [];

            for (let i = 0; i < 6; i++) {
                rightWalkFrames.push('walkRight'+(i+1)+'.png');
                leftWalkFrames.push('walkLeft'+(i+1)+'.png');
                upWalkFrames.push('walkUp'+(i+1)+'.png');
                downWalkFrames.push('walkDown'+(i+1)+'.png');
            }

            let rightWalkAnimation = this.animations.add('rightWalkAnimation', rightWalkFrames, 16, true);
            let leftWalkAnimation = this.animations.add('leftWalkAnimation', leftWalkFrames, 16, true);
            let downWalkAnimation = this.animations.add('downWalkAnimation', downWalkFrames, 16, true);
            let upWalkAnimation = this.animations.add('upWalkAnimation', upWalkFrames, 16, true);
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
                    this.frameName = 'standRight.png';
                    break;
                case this.FacePositions.LEFT:
                    this.frameName = 'standLeft.png';
                    break;
                case this.FacePositions.UP:
                    this.frameName = 'standUp.png';
                    break;
                case this.FacePositions.DOWN:
                    this.frameName = 'standDown.png';
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

        private getPointsBaseOnFrame() {

            if (/Right/.test(this.frameName)) {
                return new Phaser.Point(this.x + 10, this.y);
            }

            if (/Left/.test(this.frameName)) {
                return new Phaser.Point(this.x - 10, this.y);
            }

            if (/Up/.test(this.frameName)) {
                return new Phaser.Point(this.x, this.y - 10);
            }

            if (/Down/.test(this.frameName)) {
                return new Phaser.Point(this.x, this.y + 10);
            }
        }
    }
}
