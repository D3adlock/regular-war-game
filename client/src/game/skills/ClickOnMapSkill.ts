/// <reference path="Player.ts" />
/// <reference path="../animations/PlayerAnimationFactory.ts" />

module Rwg {

    export class ClickOnMapSkill {

        public skillName:string;
        public range:number;
        public castingSpeed:number;
        public coolDown:number;
        public castKey: any;
        public effect: any;
        public velocitySpeed:number;

        public singleAnimation: boolean;
        public framesForTheAnimation: number;

        public provide(game: Phaser.Game, player: Player, skillSlotIndex:number) {

            player.skills[this.skillName] = {};
            player.skills[this.skillName].effect = this.effect.bind(player); 
            player.skills[this.skillName].skillThrown = this.getSkillThrownMethod(this.skillName).bind(player);
            player.skills[this.skillName].castingSpeed = this.castingSpeed;
            player.skills[this.skillName].skillName = this.skillName;

            if (player.isUserPlayer) {
                player.skills[this.skillName].skillTime = 0;
                player.skills[this.skillName].range = this.range;
                player.skills[this.skillName].coolDown = this.coolDown;
                player.skills[this.skillName].castKey = this.castKey;
                player.skills[this.skillName].casting = false;
                player.skills[this.skillName].velocitySpeed = this.velocitySpeed;

                let key = game.input.keyboard.addKey(this.castKey);
                key.onDown.add(this.getSkillSelectedMethod(this.skillName), player);
                player.skills[this.skillName].skillTrigger = this.getSkillTriggerMethod(this.skillName).bind(player);
            }

            // casting animations
            let animationFactory = new PlayerAnimationFactory();
            animationFactory.animId = this.skillName;
            animationFactory.cancelMovement = true;
            animationFactory.framesNumber = this.framesForTheAnimation;
            animationFactory.singleAnimation = this.singleAnimation;
            player.skills[this.skillName].playCastAnimationTowards = 
                animationFactory.getPlayAnimationTowardsMethod(player, player.skills[this.skillName].castingSpeed).bind(player);

            // skil slot
            player.skillSlots[this.skillName] = new SkillSlot(game, player, skillSlotIndex);
            player.skillSlots[this.skillName].iconName = this.skillName;
            player.skillSlots[this.skillName].coolDown = this.coolDown;
            player.skillSlots[this.skillName].render();
        }

        private getSkillSelectedMethod(skillName:string) {
            return function() {

                if (this.activeClickOnMapSkill) {
                    if (this.activeClickOnMapSkill.skillName == skillName) {
                        console.log('skill already selected');
                        return;
                    } 
                }
                    
                if (this.game.time.now < this.skills[skillName].skillTime) {
                    console.log('skill not ready yet');
                    return;
                }

                if (this.activeTargetSkill != null) {
                    for (let i = 0; i < this.targetsOver.length; i++) {
                        this.targetsOver[i].target.visible = false;
                    }
                    this.targetsOver = [];
                    this.activeTargetSkill.casting = false;
                    this.activeTargetSkill = null;
                }

                this.skillSlots[skillName].mark();

                this.activeClickOnMapSkill = this.skills[skillName];
                this.currentLeftClickAction = this.skills[skillName].skillTrigger;
            };
        }

        private getSkillThrownMethod(skillName:string) {
            return function(message:any) {
                this.skills[message.skillName].playCastAnimationTowards(this.getPointsBaseOnFrame().x,
                    this.getPointsBaseOnFrame().y);
                this.skills[message.skillName].casting = true;

                this.skills[message.skillName].effect(message);
                if (this.isUserPlayer) {
                    this.releaseClickOnMapSkill();
                }
            }
        }

        private getSkillTriggerMethod(skillName:string) {
            return function() {
                if (!this.skills[skillName].casting) {
                    let message = {
                        type: 'skillThrown',
                        playerId: this.playerId,
                        skillName: skillName,
                        x: this.x,
                        y: this.y,
                        targetX: this.game.input.worldX,
                        targetY: this.game.input.worldY,
                        range: this.skills[skillName].range,
                        velocitySpeed: this.skills[skillName].velocitySpeed
                    }

                    this.game.ws.send(message);
                    this.skills[skillName].skillThrown(message);
                    this.skills[skillName].skillTime = this.game.time.now + this.skills[skillName].coolDown;

                    this.skillSlots[skillName].use();
                }
            }
        }
    }
}
