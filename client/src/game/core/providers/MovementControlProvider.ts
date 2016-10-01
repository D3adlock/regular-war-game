/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enums/MessageType.ts" />

module Rwg {

    export class MovementControlProvider {

        constructor(speed: number) {
            this.movementSpeed = speed;
        }

        public provide(character:BaseChar) {
            character.movementSpeed = this.movementSpeed;
            
            character.movementControlEnable = true;
            character.movementControlEnableBefore = true;

            character.initCharMovementControls = this.initCharMovementControls.bind(character);
            character.movementKeysOnDown = this.movementKeysOnDown.bind(character);
            character.movementKeysOnUp = this.movementKeysOnUp.bind(character);
            character.setVelocityForKey = this.setVelocityForKey.bind(character);
            character.sendUpdateCharPosition = this.sendUpdateCharPosition.bind(character);
            character.sendUpdateCharVelocity = this.sendUpdateCharVelocity.bind(character);
            character.getSignOfYVelocity = this.getSignOfYVelocity.bind(character);
            character.getSignOfXVelocity = this.getSignOfXVelocity.bind(character);
            
            character.initCharMovementControls();

            // add listener for the change in movementControlEnable
            character.updateMethods['movementControlEnableListener'] = function() {
                if (this.movementControlEnableBefore != character.movementControlEnable) {
                    this.movementControlEnableBefore = character.movementControlEnable;
                    if (character.movementControlEnable) {
                        if (this.keyStack.length != 0) {
                            this.setVelocityForKey(this.keyStack[this.keyStack.length-1]);
                        }
                    }
                }
            }.bind(character);
        }

        private initCharMovementControls() {

            // the factor to have the right speed when move in diagonal
            this.velocityComponent  = Math.sin(Math.PI/4);
            // this is not an stack at all since we are removing randomly, but the idea is to 
            // maintain the input order
            this.keyStack = new Array();
            this.movementKeys = [Phaser.KeyCode.A, Phaser.KeyCode.D, Phaser.KeyCode.W, Phaser.KeyCode.S];
            this.game.input.keyboard.addCallbacks(this, this.movementKeysOnDown, this.movementKeysOnUp, null);
        }

        private movementKeysOnDown(event:any){
            let keyCode = event.keyCode;
            if (this.movementKeys.indexOf(keyCode) != -1 && this.keyStack.indexOf(keyCode) == -1) {
                this.keyStack.push(event.keyCode);
                this.setVelocityForKey(event.keyCode);
            }
        }

        private movementKeysOnUp(event:any){
            let keyCode = event.keyCode;
            if (this.movementKeys.indexOf(keyCode) != -1) {
                this.keyStack.splice(this.keyStack.indexOf(event.keyCode),1);
                
                if (this.keyStack.length == 0 && this.movementControlEnable) {
                    this.sendUpdateCharPosition(this.x, this.y);
                } else {
                    // tops the last input
                    this.setVelocityForKey(this.keyStack[this.keyStack.length-1]);
                }
            }
        }

        private setVelocityForKey(keyCode: number) {

            // the keyStack continues doing the stacking, but the movement is not performed
            if (!this.movementControlEnable) { return; } 

            let keySign = 1;
            if (keyCode == Phaser.KeyCode.A || keyCode == Phaser.KeyCode.W) { keySign = -1;} 

            if (keyCode == Phaser.KeyCode.A || keyCode == Phaser.KeyCode.D) {
                if (this.keyStack.indexOf(Phaser.KeyCode.W) != -1 || this.keyStack.indexOf(Phaser.KeyCode.S) != -1) {
                    this.sendUpdateCharVelocity(this.movementSpeed * this.velocityComponent * keySign,
                        this.movementSpeed * this.velocityComponent * this.getSignOfYVelocity());
                } else {
                    this.sendUpdateCharVelocity(this.movementSpeed * keySign,0);
                }
            } else if (keyCode == Phaser.KeyCode.W || keyCode == Phaser.KeyCode.S) {  
                if (this.keyStack.indexOf(Phaser.KeyCode.A) != -1 || this.keyStack.indexOf(Phaser.KeyCode.D) != -1) {
                    this.sendUpdateCharVelocity(this.movementSpeed * this.velocityComponent * this.getSignOfXVelocity(),
                        this.movementSpeed * this.velocityComponent * keySign);
                } else {
                    this.sendUpdateCharVelocity(0, this.movementSpeed * keySign);
                }
            }
        }

        private getSignOfYVelocity() {
            let indexOfW = this.keyStack.indexOf(Phaser.KeyCode.W);
            let indexOfS = this.keyStack.indexOf(Phaser.KeyCode.S);
            if (indexOfW > indexOfS ) {
                return -1;
            }  else {
                return 1;
            }
        }

        private getSignOfXVelocity() {
            let indexOfA = this.keyStack.indexOf(Phaser.KeyCode.A);
            let indexOfD = this.keyStack.indexOf(Phaser.KeyCode.D);
            if (indexOfA > indexOfD ) {
                return -1;
            }  else {
                return 1;
            }
        }

        private sendUpdateCharPosition(x:number, y: number) {
            this.game.ws.send(
            {
                name: this.name,
                x: Math.floor(x),
                y: Math.floor(y),
                type: MessageType.MOVE
            });
            this.moveCharacterToXY(x,y);
        }

        private sendUpdateCharVelocity(x:number, y:number) {
            this.game.ws.send(
            {
                name: this.name,
                x: Math.floor(x),
                y: Math.floor(y),
                positionX: Math.floor(this.x),
                positionY: Math.floor(this.y),
                type: MessageType.VELOCITY
            });
            this.setVelocity(x,y, this.x, this.y);
        }
    }
}
