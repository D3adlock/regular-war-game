/// <reference path="../enums/FacingPositions.ts" />

module Rwg {

    export class BaseChar extends Phaser.Sprite {

        /* Sprite properties
        *
        *  name: character identification
        *  
        */

        constructor(game:Phaser.Game, name:string, atlasName:string, framesPerMovement:number) {
            super(game, 80, 80, atlasName);
            this.name = name;
            this.frameName = 'standDown.png';
            this.anchor.setTo(0.5, 0.5);
            this.game.add.existing(this);


            this.game.physics.box2d.enable(this);
            this.body.setRectangle(40,25, 0, 10);
            this.body.fixedRotation = true;
            this.body.mass = 1000;

            this.game.renderMethods['debug-'+this.name] = function() {
                this.game.debug.body(this);
            }.bind(this);

            this.updateMethods = {};

            // movement animations
            let moveRightFrames = [];
            let moveLeftFrames = [];
            let moveUpFrames = [];
            let moveDownFrames = [];

            for (let i = 1; i <= framesPerMovement; i++) {
                moveRightFrames.push('moveRight'+i+'.png');
                moveLeftFrames.push('moveLeft'+i+'.png');
                moveUpFrames.push('moveUp'+i+'.png');
                moveDownFrames.push('moveDown'+i+'.png');
            }

            let moveRight = this.animations.add('moveRight', moveRightFrames, 16, true);
            let moveLeft = this.animations.add('moveLeft', moveLeftFrames, 16, true);
            let moveUp = this.animations.add('moveUp', moveUpFrames, 16, true);
            let moveDown = this.animations.add('moveDown', moveDownFrames, 16, true);
        }

        update () {
            for (var key in this.updateMethods) {
                this.updateMethods[key]();
            }
        }

        public moveCharacterToXY(x: number, y: number) {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.body.x = x;
            this.body.y = y;
            this.stopMovementAnimation();
        }

        private setVelocity(velocityX:number, velocityY:number, x:number, y:number) {
            this.body.x = x;
            this.body.y = y;
            this.body.velocity.x = velocityX;
            this.body.velocity.y = velocityY;
            this.startMoveAnimationBaseOnVelocity();
        }

        private stopMovement() {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }

        /*
         *
         *  SPRITE ANIMATION METHODS
         *
         */

        private startMoveAnimationBaseOnVelocity(){
            switch(this.getFacingBaseOnVelocity()) {
                case FacingPositions.RIGHT:
                    this.play('moveRight');
                    break;
                case FacingPositions.LEFT:
                    this.play('moveLeft');
                    break;
                case FacingPositions.UP:
                    this.play('moveUp');
                    break;
                case FacingPositions.DOWN:
                    this.play('moveDown');
            }
        }

        private stopMovementAnimation() {
            this.animations.stop('moveRight', this.frame);
            this.animations.stop('moveLeft', this.frame);
            this.animations.stop('moveUp', this.frame);
            this.animations.stop('moveDown', this.frame);

            this.changeFacingBaseOnFrame();
        }

        private getFacingBaseOnVelocity() {
            if (this.body.velocity.x > 0) {
                return FacingPositions.RIGHT;
            } else if(this.body.velocity.x < 0) {
                return FacingPositions.LEFT;
            } else if(this.body.velocity.y > 0) {
                return FacingPositions.DOWN;
            } else if(this.body.velocity.y < 0) {
                return FacingPositions.UP;
            }
        }

        private changeFacingBaseOnPoint(x:number, y:number){

            switch(this.getFacingBaseOnPoint(x,y)) {
                case FacingPositions.RIGHT:
                    this.frameName = 'standRight.png';
                    break;
                case FacingPositions.LEFT:
                    this.frameName = 'standLeft.png';
                    break;
                case FacingPositions.UP:
                    this.frameName = 'standUp.png';
                    break;
                case FacingPositions.DOWN:
                    this.frameName = 'standDown.png';
            }
        }

        private getFacingBaseOnPoint(x: number, y: number) {
            let horizontalDiff = x - this.x;
            let verticalDiff = y - this.y;

            if (horizontalDiff > 0 && Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
                return FacingPositions.RIGHT;
            } else if(horizontalDiff < 0 && Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
                return FacingPositions.LEFT;
            } else if(verticalDiff > 0 && Math.abs(horizontalDiff) < Math.abs(verticalDiff)) {
                return FacingPositions.DOWN;
            } else if(verticalDiff < 0 && Math.abs(horizontalDiff) < Math.abs(verticalDiff)) {
                return FacingPositions.UP;
            } else if (horizontalDiff > 0 && Math.abs(horizontalDiff) == Math.abs(verticalDiff)) {
                return FacingPositions.RIGHT;
            } else if(horizontalDiff < 0 && Math.abs(horizontalDiff) == Math.abs(verticalDiff)) {
                return FacingPositions.LEFT;
            }
        }

        private changeFacingBaseOnFrame(){

            if (/Down/.test(this.frameName)) {
                this.frameName = 'standDown.png';
                return;
            }
            if (/Right/.test(this.frameName)) {
                this.frameName = 'standRight.png';
                return;
            }
            if (/Left/.test(this.frameName)) {
                this.frameName = 'standLeft.png';
                return;
            }
            if (/Up/.test(this.frameName)) {
                this.frameName = 'standUp.png';
                return;
            }

            // default
            this.frameName = 'standDown.png';
        }

        private getAheadPointBaseOnCurrentFrame() {

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
