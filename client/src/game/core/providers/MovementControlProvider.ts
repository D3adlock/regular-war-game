/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enums/MessageType.ts" />
/// <reference path="../enums/ MovementVectors.ts" />

module Rwg {

    export class MovementControlProvider {

        public provide(character:BaseChar) {
            
            character.movementControlEnable = true;
            character.movementControlEnableBefore = true;

            character.initCharMovementControls = this.initCharMovementControls.bind(character);
            character.movementKeysOnDown = this.movementKeysOnDown.bind(character);
            character.movementKeysOnUp = this.movementKeysOnUp.bind(character);
            character.setVelocityForKey = this.setVelocityForKey.bind(character);
            character.sendUpdateCharPosition = this.sendUpdateCharPosition.bind(character);
            character.sendUpdateCharVelocity = this.sendUpdateCharVelocity.bind(character);
            
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
                    this.sendUpdateCharPosition();
                } else {
                    // tops the last input
                    this.setVelocityForKey(this.keyStack[this.keyStack.length-1]);
                }
            }
        }

        private setVelocityForKey(keyCode: number) {

            // the keyStack continues doing the stacking, but the movement is not performed
            if (!this.movementControlEnable) { return; } 

            let lastKeyPressBitMask = null;
            switch (keyCode) {
                case Phaser.KeyCode.A:
                    lastKeyPressBitMask = KeysBitMask.A;
                    break;
                case Phaser.KeyCode.D:
                    lastKeyPressBitMask = KeysBitMask.D;
                    break;
                case Phaser.KeyCode.W:
                    lastKeyPressBitMask = KeysBitMask.W;
                    break;
                case Phaser.KeyCode.S:
                    lastKeyPressBitMask = KeysBitMask.S;
                    break;
            }

            let movementVectorsBitMask = lastKeyPressBitMask;

            // if there is another key pressed
            if (this.keyStack.length > 1) {
                let secondToLastPressKeyBitMask = null;
                switch (this.keyStack[this.keyStack.length-2]) {
                    case Phaser.KeyCode.A:
                        secondToLastPressKeyBitMask = KeysBitMask.A;
                        break;
                    case Phaser.KeyCode.D:
                        secondToLastPressKeyBitMask = KeysBitMask.D;
                        break;
                    case Phaser.KeyCode.W:
                        secondToLastPressKeyBitMask = KeysBitMask.W;
                        break;
                    case Phaser.KeyCode.S:
                        secondToLastPressKeyBitMask = KeysBitMask.S;
                        break;
                }

                let result = lastKeyPressBitMask | secondToLastPressKeyBitMask
                if (result != MovementVectorsBitMask.NOT_DEF_1 && result != MovementVectorsBitMask.NOT_DEF_2) {
                    movementVectorsBitMask = result;
                }
            }

            this.sendUpdateCharVelocity(movementVectorsBitMask);
        }

        private sendUpdateCharPosition() {
            this.game.ws.send(
            {
                name: this.name,
                x: Math.floor(this.x),
                y: Math.floor(this.y),
                type: MessageType.MOVE
            });
            this.moveCharacterToXY(this.x,this.y);
        }

        private sendUpdateCharVelocity(velocityBitMask:number) {
            this.game.ws.send(
            {
                name: this.name,
                x: Math.floor(this.x),
                y: Math.floor(this.y),
                velocityBitMask: velocityBitMask,
                type: MessageType.VELOCITY
            });
            this.setVelocity(this.x,this.y, velocityBitMask);
        }
    }
}
