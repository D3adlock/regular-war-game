/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enums/MessageType.ts" />
/// <reference path="../factories/CharAnimFactory.ts" />

module Rwg {

    export class TargetSkillControlProvider {

        public name:string;
        public range:number;
        public coolDown:number;
        public activationKey: any;
        public maxTargetsSelected: number;
        public targetOnAlly:boolean;
        private icon:string;

        constructor(args:any) {
            this.name = args.name;
            this.range = args.range;
            this.coolDown = args.coolDown;
            this.activationKey = args.activationKey;
            this.maxTargetsSelected = args.maxTargetsSelected;
            this.targetOnAlly = args.targetOnAlly;
            this.icon = args.icon;
        }

        public provide(game:Phaser.Game, character:BaseChar) {

            character.skills[this.name].skillTime = 0;
            character.skills[this.name].range = this.range;
            character.skills[this.name].coolDown = this.coolDown;
            character.skills[this.name].activationKey = this.activationKey;
            character.skills[this.name].maxTargetsSelected = this.maxTargetsSelected;
            character.skills[this.name].casting = false;
            character.skills[this.name].targetOnAlly = this.targetOnAlly;
            character.skills[this.name].icon = this.icon;
            character.skills[this.name].releaseSkill = this.getReleaseSkillMethod(this.name).bind(character);
            character.skills[this.name].select = this.getSkillSelectedMethod(this.name).bind(character);
            character.skills[this.name].skillTrigger = this.getSkillTriggerMethod(this.name).bind(character);
            
            character.updateMethods['checkRangeFor'+this.name] = this.getCheckRangeForSkillMethod(this.name).bind(character);
        }

        private getSkillSelectedMethod(skillName:string) {
            return function() {
                if (this.currentSelectedSkill) {
                    if (this.skills[skillName].casting) {
                        return;
                    }

                    this.skills[this.currentSelectedSkill].releaseSkill(true);
                }

                this.maxTargetsSelected = this.skills[skillName].maxTargetsSelected;
                this.targetsOver = [];

                this.currentSelectedSkill = skillName;
                this.currentLeftClickAction = this.skills[skillName].skillTrigger;
            };
        }

        private getSkillTriggerMethod(skillName:string) {
            return function() {
                
                if (this.game.time.now < this.skills[skillName].skillTime) {
                    console.log('skill not ready yet');
                    return;
                }

                if (this.skills[skillName].casting) {
                    console.log('still casting');
                    return;
                }

                if (this.targetsOver.length > 0) {
                    let targets = [];
                    for (let i=0; i < this.targetsOver.length; i++) {
                        targets.push(this.targetsOver[i].name);
                    }
                    let message = {
                        type: MessageType.SKILL,
                        name: this.name,
                        skillName: skillName,
                        x: this.x,
                        y: this.y,
                        target: targets
                    }

                    this.movementControlEnable = false;
                    this.skills[skillName].casting = true;
                    this.game.time.events.add(this.skills[skillName].castingSpeed,
                        function(){ 
                            this.movementControlEnable = true;
                            this.skills[skillName].releaseSkill();
                        }
                    ,this);

                    this.game.ws.send(message);
                    this.skills[skillName].skillThrown(message);

                    this.skills[skillName].skillTime = this.game.time.now + this.skills[skillName].coolDown;
                } else {
                    console.log('no targets selected');
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
                        this.targetsOver[i].target.visible = false;
                    }
                }
                this.targetsOver = newTargets;
            }
        }

        private getReleaseSkillMethod(skillName:string) {
            return function(hardRelease:boolean) {
                for (let i = 0; i < this.targetsOver.length; i++) {
                    this.targetsOver[i].target.visible = false;
                }
                this.targetsOver = [];
                this.skills[skillName].casting = false;

                if(hardRelease) {
                    this.maxTargetsSelected = 0;
                    this.currentSelectedSkill = null;
                }
            }
        }
    }
}
