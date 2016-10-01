/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enums/MessageType.ts" />
/// <reference path="../enums/ActionTypes.ts" />
/// <reference path="../factories/CharAnimFactory.ts" />

module Rwg {

    export class AreaSkillControlProvider {

        public name:string;
        public range:number;
        public coolDown:number;
        public castKey: any;

        constructor(args:any) {
            this.name = args.name;
            this.range = args.range;
            this.coolDown = args.coolDown;
            this.castKey = args.castKey;
        }

        public provide(game:Phaser.Game, character:BaseChar) {

            character.skills[this.name].skillTime = 0;
            character.skills[this.name].range = this.range;
            character.skills[this.name].coolDown = this.coolDown;
            character.skills[this.name].castKey = this.castKey;
            character.skills[this.name].casting = false;

            character.skills[this.name].releaseSkill = this.getReleaseSkillMethod(this.name).bind(character);

            let key = game.input.keyboard.addKey(this.castKey);
            key.onDown.add(this.getSkillSelectedMethod(this.name), character);
            
            character.skills[this.name].skillTrigger = this.getSkillTriggerMethod(this.name).bind(character);
        }

        private getSkillSelectedMethod(skillName:string) {
            return function() {
                
                console.log('asdasd')

                if (this.currentSelectedSkill) {
                    if (this.skills[skillName].casting) {
                        return;
                    }

                    this.skills[this.currentSelectedSkill].releaseSkill(true);
                }

                this.skillAreaTarget.range = this.skills[skillName].range;
                this.skillAreaTarget.active = true;

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

                if (this.skillAreaTarget.visible) {
                    
                    let message = {
                        type: MessageType.SKILL,
                        name: this.name,
                        skillName: skillName,
                        x: this.x,
                        y: this.y,
                        target: { 
                            x: this.skillAreaTarget.x,
                            y: this.skillAreaTarget.y 
                        }
                    }

                    this.movementControlEnable = false;
                    this.skills[skillName].casting = true;
                    this.skillAreaTarget.active = false;
                    this.skillAreaTarget.visible = false;
                    this.game.time.events.add(this.skills[skillName].castingSpeed,
                        function(){ 
                            this.movementControlEnable = true;
                            this.skillAreaTarget.active = true;
                            this.skills[skillName].releaseSkill();
                        }
                    ,this);

                    this.game.ws.send(message);
                    this.skills[skillName].skillThrown(message);

                    this.skills[skillName].skillTime = this.game.time.now + this.skills[skillName].coolDown;
                }
            }
        }

        private getReleaseSkillMethod(skillName:string) {
            return function(hardRelease:boolean) {
                this.skills[skillName].casting = false;

                if(hardRelease) {
                    this.skillAreaTarget.range = 0;
                    this.skillAreaTarget.active = false;
                    this.skillAreaTarget.visible = false;
                }
            }
        }
    }
}
