/// <reference path="../super/BaseChar.ts" />

/// <reference path="../enums/AttackTypes.ts" />
/// <reference path="../enums/SkillTypes.ts" />
/// <reference path="../enums/ActionTypes.ts" />

/// <reference path="../providers/MovementControlProvider.ts" />
/// <reference path="../providers/AttackProvider.ts" />
/// <reference path="../providers/RangedAttackProvider.ts" />
/// <reference path="../providers/AttackControlProvider.ts" />
/// <reference path="../providers/SkillProvider.ts" />
/// <reference path="../providers/TargetSkillControlProvider.ts" />
/// <reference path="../providers/AreaSkillControlProvider.ts" />

module Rwg {

    export class CharFactory {
    
    	public static getChar(args:any) {

    		if (!(args.game && args.atlasName && args.framesPerMovement && args.name)) {
    			throw new Error('Error creating character - missing arguments ' +
    				'args.game && args.atlasName && args.framesPerMovement && args.name');
    		}

    		CharFactory.checkFrames(args.game, args.atlasName, args.framesPerMovement);
    		let newChar = new BaseChar(args.game, args.name, args.atlasName, args.framesPerMovement);

            if (args.scale) { newChar.scale.setTo(args.scale); }

    		if (args.controlable) { (new MovementControlProvider(args.movementSpeed)).provide(newChar);}

    		if (args.attacks) {
                newChar.attacks = {};

                for (let i=0; i < args.attacks.length ; i++) {
                    (new AttackProvider(args.attacks[i])).provide(args.game, newChar);
                }
		    }

            if (args.skills) {
                newChar.skills = {};

                for (let i=0; i < args.skills.length ; i++) {
                    (new SkillProvider(args.skills[i])).provide(args.game, newChar);
                }
            }

            if (args.attackControls || args.skillControls) {

                newChar.currentLeftClickAction = null;
                newChar.currentSelectedSkill = null;

                newChar.updateMethods['leftClickAction'] = function() {
                    if (this.game.input.activePointer.leftButton.isDown && this.currentLeftClickAction) {
                        this.currentLeftClickAction();
                    }
                }.bind(newChar);
            }

    		if (args.attackControls) {
                for (let i=0; i < args.attackControls.length ; i++) {
                    (new AttackControlProvider(args.attackControls[i])).provide(args.game, newChar);
                }
    		}

            if (args.skillControls) {
                if (CharFactory.useSkillType(args.skillControls, SkillTypes.TARGET)) {
                    newChar.maxTargetsSelected = 0;
                    newChar.targetsOver = [];
                    newChar.canTarget = true
                    CharFactory.addTargetMethods(newChar);
                }

                if (CharFactory.useSkillType(args.skillControls, SkillTypes.AREA)) {
                    CharFactory.addSkillAreaMethods(args.game, newChar);
                }

                for (let i=0; i < args.skillControls.length ; i++) {
                    switch(args.skillControls[i].type) {
                        case SkillTypes.TARGET:
                            (new TargetSkillControlProvider(args.skillControls[i])).provide(args.game, newChar);
                            break;
                        case SkillTypes.AREA:
                            (new AreaSkillControlProvider(args.skillControls[i])).provide(args.game, newChar);
                    }
                }
            }

            if (args.targetable && args.name != args.game.player.name) {
                args.game.player.addTargetable(newChar);
            }

    		return newChar;
    	}

        private static useSkillType(skillControls:any, skillType:SkillTypes) {
            for (let i=0; i < skillControls.length ; i++) {
                if (skillControls[i].type == skillType) {
                    return true;
                }
            }
            return false;
        }

        private static addSkillAreaMethods(game:Phaser.Game, character:BaseChar) {
            character.skillAreaTarget = game.add.sprite(80, 80, 'target');
            character.skillAreaTarget.visible = false;
            character.skillAreaTarget.anchor.set(0.5,0.5);
            character.skillAreaTarget.range = 0;
            character.skillAreaTarget.active = false;

            character.updateMethods['skillArePointer'] = function() {
                if (this.skillAreaTarget.active) {
                    let cursorPoint = new Phaser.Point(Math.floor(this.game.input.worldX),
                        Math.floor(this.game.input.worldY))

                    if (Phaser.Point.distance(cursorPoint, this.position) < character.skillAreaTarget.range) {
                        this.skillAreaTarget.position = cursorPoint;
                        this.skillAreaTarget.visible = true;
                    } else {
                        this.skillAreaTarget.visible = false;
                    }
                } 
            }.bind(character);
        }

        private static addTargetMethods(character:BaseChar) {

            character.addTargetable = function(targetable) {

                targetable.target = this.game.add.sprite(this.x, this.y, 'target');
                targetable.target.position = targetable.position;
                targetable.target.visible = false;
                targetable.target.anchor.set(0.5,0.5);

                targetable.events.onInputOver.add(this.targetOver, this);
                targetable.inputEnabled = true;
            }.bind(character)

            character.targetOver = function(targetedChar) {
                if (this.targetsOver.length < this.maxTargetsSelected) {

                    for(let i= 0; i < this.targetsOver.length; i++) {
                        if (this.targetsOver[i].name == targetedChar.name) {
                            return;
                        }
                    }

                    if (this.skills[this.currentSelectedSkill].targetOnAlly) {
                        if (targetedChar.team == this.team) {
                            this.targetsOver.push(targetedChar);
                            targetedChar.target.visible = true;
                        }
                    } else {
                        if (targetedChar.team != this.team) {
                            this.targetsOver.push(targetedChar);
                            targetedChar.target.visible = true;
                        }
                    }
                }
            }.bind(character);
        }

        /*
         *
         * VALIDATION SECTION
         *
         */

        private static checkFrames(game: Phaser.Game, atlasName:string, framesPerMovement:number) {

            let baseFrames = ['standDown.png','standUp.png','standLeft.png','standRight.png'];

            for(let i=1;i<=framesPerMovement;i++) {
                baseFrames.push('moveRight'+i+'.png');
                baseFrames.push('moveLeft'+i+'.png');
                baseFrames.push('moveUp'+i+'.png');
                baseFrames.push('moveDown'+i+'.png');
            }

            let missingFrames = [];

            for(let i=0;i<baseFrames.length;i++) {
                if (!game.cache.getFrameByName(atlasName, baseFrames[i])) {
                    missingFrames.push(atlasName+'/'+baseFrames[i]);
                }
            }

            if (missingFrames.length > 0) {
                throw new Error('Error creating character - missing frames ['+ missingFrames +']');
            }
        }
    }
}
