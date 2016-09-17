/// <reference path="Player.ts" />

module Rwg {

    export class PlayerMovementControls {

        constructor(speed: number) {
            this.movementSpeed = speed;
        }

        public provide(player: Player) {
            player.movementSpeed = this.movementSpeed;
            player.MovemenrtControlEnable = true;

            player.initPlayerMovementControls = this.initPlayerMovementControls.bind(player);
            player.movementKeysOnDown = this.movementKeysOnDown.bind(player);
            player.movementKeysOnUp = this.movementKeysOnUp.bind(player);
            player.setVelocityForKey = this.setVelocityForKey.bind(player);
            player.sendUpdatePlayerPosition = this.sendUpdatePlayerPosition.bind(player);
            player.sendUpdatePlayerVelocity = this.sendUpdatePlayerVelocity.bind(player);
            player.getSignOfYVelocity = this.getSignOfYVelocity.bind(player);
            player.getSignOfXVelocity = this.getSignOfXVelocity.bind(player);
            
            player.initPlayerMovementControls();
        }

        private initPlayerMovementControls() {

            // the factor to have the right speed when move in diagonal
            this.velocityComponent  = Math.sin(Math.PI/4);
            // this is not an stack at all since we are removing randomly, but the idea is to 
            // maintain the input order
            this.keyStack = new Array();
            this.movementKeys = [Phaser.KeyCode.A, Phaser.KeyCode.D, Phaser.KeyCode.W, Phaser.KeyCode.S];
            this.game.input.keyboard.addCallbacks(this, this.movementKeysOnDown, this.movementKeysOnUp, null);

            // adds the movement key capture methods to the key up and down methods list
            this.keyDownInputMethods['movementKeysOnDown'] = function(event:any) {
                this.movementKeysOnDown(event);
            }.bind(this);
            this.keyUpInputMethods['movementKeysOnUp'] = function(event:any) {
                this.movementKeysOnUp(event);
            }.bind(this);
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
                
                if (this.keyStack.length == 0) {
                    this.sendUpdatePlayerPosition(this.x, this.y);
                } else {
                    // tops the last input
                    this.setVelocityForKey(this.keyStack[this.keyStack.length-1]);
                }
            }
        }

        private setVelocityForKey(keyCode: number) {

            // the keyStack continues doing the stacking, but the movement is not performed
            if (!this.MovemenrtControlEnable) { return; } 

            let keySign = 1;
            if (keyCode == Phaser.KeyCode.A || keyCode == Phaser.KeyCode.W) { keySign = -1;} 

            if (keyCode == Phaser.KeyCode.A || keyCode == Phaser.KeyCode.D) {
                if (this.keyStack.indexOf(Phaser.KeyCode.W) != -1 || this.keyStack.indexOf(Phaser.KeyCode.S) != -1) {
                    this.sendUpdatePlayerVelocity(this.movementSpeed * this.velocityComponent * keySign,
                        this.movementSpeed * this.velocityComponent * this.getSignOfYVelocity());
                } else {
                    this.sendUpdatePlayerVelocity(this.movementSpeed * keySign,0);
                } 
            } else if (keyCode == Phaser.KeyCode.W || keyCode == Phaser.KeyCode.S) {
                
                if (this.keyStack.indexOf(Phaser.KeyCode.A) != -1 || this.keyStack.indexOf(Phaser.KeyCode.D) != -1) {
                    this.sendUpdatePlayerVelocity(this.movementSpeed * this.velocityComponent * this.getSignOfXVelocity(),
                        this.movementSpeed * this.velocityComponent * keySign);
                } else {
                    this.sendUpdatePlayerVelocity(0, this.movementSpeed * keySign);
                }
            }
        }

        private getSignOfYVelocity() {
            if (this.body.velocity.y != 0) {
                return Math.sign(this.body.velocity.y);
            } else {
                let indexOfW = this.keyStack.indexOf(Phaser.KeyCode.W);
                let indexOfS = this.keyStack.indexOf(Phaser.KeyCode.S);
                if (indexOfW > indexOfS ) {
                    return -1;
                }  else {
                    return 1;
                }
            }
        }

        private getSignOfXVelocity() {
            if (this.body.velocity.x != 0) {
                return Math.sign(this.body.velocity.x);
            } else {
                let indexOfA = this.keyStack.indexOf(Phaser.KeyCode.A);
                let indexOfD = this.keyStack.indexOf(Phaser.KeyCode.D);
                if (indexOfA > indexOfD ) {
                    return -1;
                }  else {
                    return 1;
                }
            }
        }

        private sendUpdatePlayerPosition(x:number, y: number) {
            this.game.ws.send(
            {
                color: this.color,
                playerId: this.playerId,
                x: x,
                y: y,
                type: 'updatePlayerPosition',
                team: this.team,
                fightType: this.fightType
            });
        }

        private sendUpdatePlayerVelocity(x:number, y:number) {
            this.game.ws.send(
            {
                color: this.color,
                playerId: this.playerId,
                velocityX: x,
                velocityY: y,
                x: this.x,
                y: this.y,
                type: 'updatePlayerVelocity',
                team: this.team,
                fightType: this.fightType
            });
        }
    }
}
