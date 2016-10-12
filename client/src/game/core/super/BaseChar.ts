/// <reference path="../enums/FacingPositions.ts" />
/// <reference path="../enums/CollisionCategory.ts" />

module Rwg {

    export class BaseChar extends Phaser.Sprite {

        /* Sprite properties
        *
        *  name: character identification
        *  
        */

        constructor(game:Phaser.Game, name:string, atlasName:string, framesPerMovement:number, scale:number) {
            super(game, 80, 80, atlasName);
            this.name = name;
            this.frameName = 'standDown.png';
            this.anchor.setTo(0.5, 0.5);
            this.game.add.existing(this);
            this.updateMethods = {};

            //enable physics
            this.game.physics.box2d.enable(this);
            this.body.clearFixtures();

            if (scale) {this.scale.setTo(scale);}
            
            // the body fixture to handle collisions with elements
            this.collisionHitbox = this.body.addRectangle(Math.floor(this.width/2),
                Math.floor(this.height/2), 0, Math.floor(this.height/4));
            this.collisionHitbox.m_filter.maskBits = CollisionCategory.WALL | CollisionCategory.CHAR_BODY;
            this.collisionHitbox.m_filter.categoryBits = CollisionCategory.CHAR_BODY;

            this.damageHitbox = this.body.addRectangle(this.width,
                this.height, 0, 0);

            this.body.fixedRotation = true;
            this.body.linearDamping = 10;


            //Movement Settings
            this.holdSpeed = false;
            this.maxSpeed = 0; 
            this.directionX = 0;
            this.directionY = 0;
            // speed update method
            this.updateMethods['speedUpdateMethod'] = function() {
                if (this.holdSpeed) {

                    this.body.mass = this.dinamicMass;

                    if (Math.abs(this.body.velocity.x) < this.maxSpeed) {
                        this.body.velocity.x = this.body.velocity.x + (100 * this.directionX);
                    } else {
                        this.body.velocity.x = this.maxSpeed * this.directionX;
                    }

                    if (Math.abs(this.body.velocity.y) < this.maxSpeed) {
                        this.body.velocity.y = this.body.velocity.y + (100 * this.directionY);
                    } else {
                        this.body.velocity.y = this.maxSpeed * this.directionY;
                    }
                } else {
                    this.body.mass = this.staticMass;
                }
            }.bind(this);

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



            // holds who hitted this player
            this.hittedStack = [];

            // Health Settings
            this.maxHP = 1;
            this.currentHP = 1;
            this.regenHPperSec = 0.1
            this.maxMP = 1;
            this.currentMP = 1;
            this.regenMPperSec = 0.1
            this.healthRestorationTime = 0;
            this.updateMethods['healthRestorationTime'] = function() {
                if (this.maxHP == this.currentHP && this.maxMP == this.currentMP) {
                    return;
                }

                if (this.game.time.now > this.healthRestorationTime) {
                    if ((this.currentHP + (this.maxHP*this.regenHPperSec)) > this.maxHP) {
                        this.currentHP = this.maxHP;
                    } else {
                        this.currentHP = this.currentHP + (this.maxHP*this.regenHPperSec);
                    }

                    if ((this.currentMP + (this.maxMP*this.regenMPperSec)) > this.maxMP) {
                        this.currentMP = this.maxMP;
                    } else {
                        this.currentMP = this.currentMP + (this.maxMP*this.regenMPperSec);
                    }
                    
                    this.healthRestorationTime = this.game.time.now + 1000;
                }
            }.bind(this);
            this.updateMethods['checkKilled'] = function() {
                if (this.killed) {
                    this.moveCharacterToXY(this.respawn.x,this.respawn.y);
                    this.killed = false;
                }
            }.bind(this);
        }

        update () {
            for (var key in this.updateMethods) {
                this.updateMethods[key]();
            }
        }

        /*
         *  MOVEMENT METHODS 
         */

        public moveCharacterToXY(x: number, y: number) {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.speedX = 0;
            this.speedY = 0;
            this.body.x = x;
            this.body.y = y;
            this.stopMovementAnimation();
            this.holdSpeed = false;
        }

        private setVelocity(x:number, y:number, velocityBitMask:string) {

            this.body.x = x;
            this.body.y = y;

            // set the max velocity
            this.maxSpeed = this.movementSpeed;
            let stringBitMask = velocityBitMask.toString(2);
            if ((stringBitMask.split('1').length - 1) == 2) {
                this.maxSpeed *=  Math.sin(Math.PI/4);
            }

            // bitmask array manipulation
            let bitMaskArray = stringBitMask.split('').reverse();
            let bitMaskIntArray = [];
            for(let i=0; i <  bitMaskArray.length; i++) {
                bitMaskIntArray.push(parseInt(bitMaskArray[i]));
            }

            // set the directions from the bitmask array
            this.directionX = 0;
            this.directionY = 0;
            if (bitMaskIntArray[0]) {this.directionX = -1;}
            if (bitMaskIntArray[1]) {this.directionX = 1;}
            if (bitMaskIntArray[2]) {this.directionY = -1;}
            if (bitMaskIntArray[3]) {this.directionY = 1;}

            this.body.velocity.x = this.maxSpeed * this.directionX;
            this.body.velocity.y = this.maxSpeed * this.directionY;
            
            this.startMoveAnimationBaseOnVelocity();
            this.holdSpeed = true;
        }

        private stopMovement() {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        }

        /*
         *  DAMAGE 
         */

        public damage(message:any) {
            this.killed    = message.killed;
            this.currentHP = message.currentHP;
        }

        /*
         *  SPRITE ANIMATION METHODS
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

        /*
         *  UTIL METHODS
         */

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

            // default
            return new Phaser.Point(this.x, this.y + 10);
        }
    }
}
