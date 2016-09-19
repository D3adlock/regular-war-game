/// <reference path="Player.ts" />
/// <reference path="../animations/PlayerAnimationFactory.ts" />

module Rwg {

    export class TargetSkill {

        public skillName:string;
        public range:number;
        public castingSpeed:number;
        public coolDown:number;
        public castKey: any;
        public maxTargetsSelected: number;
        public effect: any;
        public singleAnimation: boolean;
        public framesForTheAnimation: number;
        public targetOnAlly:boolean;

        public provide(game: Phaser.Game, player: Player) {

            player.skills[this.skillName] = {};
            player.skills[this.skillName].effect = this.effect.bind(player); 
            player.skills[this.skillName].skillThrown = this.getSkillThrownMethod(this.skillName).bind(player);
            player.skills[this.skillName].castingSpeed = this.castingSpeed;

            // range checks for targets
            if (player.isUserPlayer) {
                player.skills[this.skillName].skillTime = 0;
                player.skills[this.skillName].range = this.range;
                player.skills[this.skillName].coolDown = this.coolDown;
                player.skills[this.skillName].castKey = this.castKey;
                player.skills[this.skillName].maxTargetsSelected = this.maxTargetsSelected;
                player.skills[this.skillName].casting = false;
                player.skills[this.skillName].targetOnAlly = this.targetOnAlly;

                let key = game.input.keyboard.addKey(this.castKey);
                key.onDown.add(this.getSkillSelectedMethod(this.skillName), player);
                player.skills[this.skillName].skillTrigger = this.getSkillTriggerMethod(this.skillName).bind(player);
                player.updateMethods['checkRangeFor'+this.skillName] = this.getCheckRangeForSkillMethod(this.skillName).bind(player);
            }

            // casting animations
            let animationFactory = new PlayerAnimationFactory();
            animationFactory.animId = this.skillName;
            animationFactory.cancelMovement = true;
            animationFactory.framesNumber = this.framesForTheAnimation;
            animationFactory.singleAnimation = this.singleAnimation;
            player.skills[this.skillName].playCastAnimationTowards = 
                animationFactory.getPlayAnimationTowardsMethod(player, player.skills[this.skillName].castingSpeed).bind(player);
        }

        private getSkillSelectedMethod(skillName:string) {
            return function() {
                if (this.activeTargetSkill != skillName) {
                    if (this.game.time.now > this.skills[skillName].skillTime) {
                        
                        this.activeTargetSkill = this.skills[skillName];
                        this.maxTargetsSelected = this.skills[skillName].maxTargetsSelected;
                        this.targetsOver = [];
                        // change the attack
                        this.currentLeftClickAction = this.skills[skillName].skillTrigger;
                    } else {
                        console.log('skill not ready yet');
                    }
                } else {
                    console.log('skill already selected');
                }
            };
        }

        private getSkillThrownMethod(skillName:string) {
            return function(message:any) {
                this.skills[message.skillName].playCastAnimationTowards(this.getPointsBaseOnFrame().x,
                    this.getPointsBaseOnFrame().y);
                this.skills[message.skillName].casting = true;

                this.game.time.events.add(this.skills[message.skillName].castingSpeed,
                    function(){
                        this.skills[message.skillName].effect(message.targets);
                        if (this.isUserPlayer) {
                            this.releaseSkill();
                        }
                    }
                ,this);
            }
        }

        private getSkillTriggerMethod(skillName:string) {
            return function() {
                if (this.targetsOver.length > 0 && !this.skills[skillName].casting) {
                    let targets = [];
                    for (let i=0; i < this.targetsOver.length; i++) {
                        targets.push(this.targetsOver[i].playerId);
                    }
                    let message = {
                        type: 'skillThrown',
                        playerId: this.playerId,
                        skillName: skillName,
                        targets: targets
                    }
                    this.game.ws.send(message);
                    this.skills[skillName].skillThrown(message);
                    this.skills[skillName].skillTime = this.game.time.now + this.skills[skillName].coolDown;
                }
            }
        }

        private getCheckRangeForSkillMethod(skillName:string) {
            return function() {
                let newTargets = [];

                for (let i = 0; i < this.targetsOver.length; i++) {
                    if (Phaser.Point.distance(this.targetsOver[i].position, this.position) < this.skills[skillName].range) {
                        newTargets.push(this.targetsOver[i]);
                    } else {
                        this.targetsOver[i].targetElipse.visible = false;
                    }
                }
                this.targetsOver = newTargets;
            }
        }
    }
}
