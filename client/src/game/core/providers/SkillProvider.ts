/// <reference path="../super/BaseChar.ts" />
/// <reference path="../factories/CharAnimFactory.ts" />

module Rwg {

    export class SkillProvider {

        private name:string;
        private castingSpeed:number;
        private effect:any;
        private anim:any;
        private skillReadyIn:number;

        constructor(args:any) {
            this.name = args.name;
            this.castingSpeed = args.castingSpeed;
            this.effect = args.effect;
            this.anim = args.anim;
            this.skillReadyIn = args.skillReadyIn;
            this.animationFrames = args.animationFrames;
        }

        public provide(game: Phaser.Game, player: BaseChar) {

            player.skills[this.name] = {};
            player.skills[this.name].effect = this.effect.bind(player); 
            player.skills[this.name].skillThrown = this.getSkillThrownMethod(this.name).bind(player);
            player.skills[this.name].castingSpeed = this.castingSpeed;
            player.skills[this.name].skillReadyIn = this.skillReadyIn;
            player.skills[this.name].name = this.name;

            // this is an empty method to store an additional trigger behaviour like the skill icon or the casting bar
            player.skills[this.name].additionalOnTriggerCallBack = function(){};

            // casting animations
            let animationFactory = new CharAnimFactory(this.anim);
            player.skills[this.name].playCastAnimationTowards = animationFactory.getPlayAnimationTowardsMethod(
                this.name, player, player.skills[this.name].castingSpeed).bind(player);

        }

        private getSkillThrownMethod(skillName:string) {
            return function(message:any) {

                // fix the character position and stop movement
                this.moveCharacterToXY(message.x, message.y);

                let aheadPoint = this.getAheadPointBaseOnCurrentFrame();
                this.skills[skillName].playCastAnimationTowards(aheadPoint.x,aheadPoint.y);

                let skillThrownTime = this.skills[skillName].castingSpeed;
                if (this.skills[skillName].skillReadyIn != undefined) {
                    skillThrownTime = skillThrownTime * this.skills[skillName].skillReadyIn;
                }

                this.skills[skillName].additionalOnTriggerCallBack(skillThrownTime);

                this.game.time.events.add(skillThrownTime,
                    function(){
                        this.skills[skillName].effect(message.target);
                    }
                ,this);
            }
        }
    }
}
