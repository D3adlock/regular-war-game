/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enum/MessageType.ts" />
/// <reference path="../enum/ActionTypes.ts" />

module Rwg {

    export class AttackControlProvider {

        private attackName:string;
        private coolDown:number;
        private activationKey:number;

        constructor(args:any) {
            
            this.name = args.name;
            this.coolDown = args.coolDown;
            this.activationKey = args.activationKey;
        }

        public provide(game: Phaser.Game, character: BaseChar) {

            character.attacks[this.name].attackTime = 0;
            character.attacks[this.name].coolDown = this.coolDown;
            character.attacks[this.name].triggerAttack = this.getTriggerAttackMethod(this.name).bind(character);

            let key = game.input.keyboard.addKey(this.activationKey);
            key.onDown.add(this.getAttackSelectedMethod(this.name), character);

            // add some callbacks to the animations for the controlled attack
            character.animations.getAnimation(name);
        }

        private getTriggerAttackMethod(attackName:string) {

            return function() {
                if (this.game.time.now > this.attacks[attackName].attackTime &&
                    this.attacks[attackName].created.total < this.attacks[attackName].cadence) {

                    let message =  {
                        type: MessageType.ATTACK,
                        name: this.name,
                        targetX: Math.floor(this.game.input.worldX),
                        targetY: Math.floor(this.game.input.worldY),
                        x: Math.floor(this.x),
                        y: Math.floor(this.y),
                        attackName: attackName
                    };
                    this.game.ws.send(message);
                    
                    // sets a time out when the controlls will be available again
                    this.movementControlEnable = false;
                    this.game.time.events.add(this.attacks[attackName].attackSpeed,
                        function(){ 
                            this.movementControlEnable = true;
                        }
                    ,this);

                    this.attacks[attackName].attack(message);

                    this.attacks[attackName].attackTime = this.game.time.now + this.attacks[attackName].coolDown;
                }
            };
        }

        private getAttackSelectedMethod(attackName:string) {
            return function() {
                this.currentLeftClickAction = this.attacks[attackName].triggerAttack;

                if (this.currentSelectedSkill) {
                    this.skills[this.currentSelectedSkill].releaseSkill(true);
                }
            }
        }
    }
}
