/// <reference path="Player.ts" />

module Rwg {

    export class TargetSkill {

        private skillName:string;
        private damage:number;
        private range:number;
        private castingSpeed:number;
        private coolDown:number;
        private castKey: any;
        private maxTargetsSelected: number;
        private effect: any;

        constructor(skillName:string, damage:number, range:number, castingSpeed:number, coolDown:number,
            castKey: number, maxTargetsSelected:number, effect: any) {
            
            this.skillName = skillName;
            this.damage = damage;
            this.range = range;
            this.castingSpeed = castingSpeed;
            this.coolDown = coolDown;
            this.castKey = castKey;
            this.maxTargetsSelected = maxTargetsSelected;
            this.effect = effect;
        }

        public provide(game: Phaser.Game, player: Player) {
            player.skills[this.skillName] = {};

            player.skills[this.skillName].damage = this.damage;
            player.skills[this.skillName].range = this.range;
            player.skills[this.skillName].castingSpeed = this.castingSpeed;
            player.skills[this.skillName].coolDown = this.coolDown;
            player.skills[this.skillName].castKey = this.castKey;
            player.skills[this.skillName].maxTargetsSelected = this.maxTargetsSelected;
            player.skills[this.skillName].coolDownTime = 0;

            let key = game.input.keyboard.addKey(this.castKey);
            key.onDown.add(this.onKeyDownMethod(), player);

            let effect = this.effect;
            // the effect on player method
            player.updateMethods[this.skillName + 'Fire'] = function() {
                if (this.game.input.activePointer.leftButton.isDown && this.targetEnabled 
                    && this.targetsOver.length > 0) {
                    effect(this.targetsOver);
                    this.releaseTarget();
                }
            }.bind(player);
        }

        private onKeyDownMethod() {
            let skillName = this.skillName;
            return  function(event) {
                if (this.game.time.now > this.skills[skillName].coolDownTime) {
                    // set the target values
                    this.maxTargetsSelected = this.skills[skillName].maxTargetsSelected;
                    this.targetsOver = [];
                    this.targetEnabled = true;
                    this.attackControlsEnabled = false;
                    this.skills[skillName].coolDownTime = this.game.time.now + this.skills[skillName].coolDown;
                } else {
                    console.log('skill not ready yet');
                }
            }
        }
    }
}
