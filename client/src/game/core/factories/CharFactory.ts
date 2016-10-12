/// <reference path="../super/BaseChar.ts" />

/// <reference path="../enums/SkillTypes.ts" />
/// <reference path="../enums/ActionTypes.ts" />
/// <reference path="../enums/CollisionCategory.ts" />

/// <reference path="../providers/MovementControlProvider.ts" />

/// <reference path="../providers/AttackProvider.ts" />
/// <reference path="../providers/AttackControlProvider.ts" />

/// <reference path="../providers/SkillProvider.ts" />
/// <reference path="../providers/TargetSkillControlProvider.ts" />
/// <reference path="../providers/AreaSkillControlProvider.ts" />
/// <reference path="../providers/SpriteUIProvider.ts" />

module Rwg {

    export class CharFactory {
    
    	public static getChar(args:any, game:Phaser.Game) {

            // validators for the char argument
    		if (!(game && args.atlasName && args.framesPerMovement && args.name)) {
    			throw new Error('Error creating character - missing arguments ' +
    				'game && args.atlasName && args.framesPerMovement && args.name');
    		}
    		CharFactory.checkFrames(game, args.atlasName, args.framesPerMovement);

    		let newChar = new BaseChar(game, args.name, args.atlasName, args.framesPerMovement,  args.scale);
            newChar.movementSpeed = args.movementSpeed;
            newChar.staticMass = args.staticMass;
            newChar.dinamicMass = args.dinamicMass;
            newChar.team = args.team;

            // health settings
            if (args.health) {
                newChar.maxHP = args.health.maxHP;
                newChar.currentHP = args.health.maxHP;
                newChar.regenHPperSec = args.health.regenHPperSec;
                newChar.maxMP = args.health.maxMP;
                newChar.currentMP = args.health.maxMP;
                newChar.regenMPperSec = args.health.regenMPperSec;
            }

    		if (args.controlable) { (new MovementControlProvider()).provide(newChar);}

    		if (args.attacks) {
                newChar.attacks = {};

                for (let i=0; i < args.attacks.length ; i++) {
                    (new AttackProvider(args.attacks[i])).provide(game, newChar);
                }
		    }

            if (args.skills) {
                newChar.skills = {};

                for (let i=0; i < args.skills.length ; i++) {
                    (new SkillProvider(args.skills[i])).provide(game, newChar);
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
                    (new AttackControlProvider(args.attackControls[i])).provide(game, newChar);
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
                    CharFactory.addSkillAreaMethods(game, newChar);
                }

                for (let i=0; i < args.skillControls.length ; i++) {
                    switch(args.skillControls[i].type) {
                        case SkillTypes.TARGET:
                            (new TargetSkillControlProvider(args.skillControls[i])).provide(game, newChar);
                            break;
                        case SkillTypes.AREA:
                            (new AreaSkillControlProvider(args.skillControls[i])).provide(game, newChar);
                    }
                }
            }

            let state = game.state.getCurrentState();
            if (args.targetable && args.name != state.player.name) {
                state.player.addTargetable(newChar);
            }

            (new SpriteUIProvider()).provide(game, newChar);

            if (args.debugBody) {
                game.renderMethods['debugBody'+args.name] = function() {
                    this.game.debug.body(newChar);
                }.bind(newChar);
            }

            // setUp the colision detection
            // the damageHitbox will response to ATTACK category colisions
            newChar.damageHitbox.m_filter.maskBits = CollisionCategory.ATTACK;
            if (newChar.team) {
                // the category of the hit area of this character will be TEAM_ONE_HITBOX
                newChar.damageHitbox.m_filter.categoryBits = CollisionCategory.TEAM_ONE_HITBOX;
                // the attack will response to colision with TEAM_ZERO_HITBOX and WALL
                newChar.attackMask = CollisionCategory.TEAM_ZERO_HITBOX | CollisionCategory.WALL;
                // the attack will do something special when it colides with TEAM_ZERO_HITBOX
                newChar.attackCollision = CollisionCategory.TEAM_ZERO_HITBOX;    
            } else {
                // same as avobe
                newChar.damageHitbox.m_filter.categoryBits = CollisionCategory.TEAM_ZERO_HITBOX;
                newChar.attackMask = CollisionCategory.TEAM_ONE_HITBOX | CollisionCategory.WALL;
                newChar.attackCollision = CollisionCategory.TEAM_ONE_HITBOX;  
            }

            // adds the send damage method
            if (!state.player){
                CharFactory.addSendDamageUpdateMethod(newChar);
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

                targetable.target = this.game.add.sprite(targetable.x, targetable.y, 'target');
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

        private static addSendDamageUpdateMethod(character:any) {
            character.sendDamageUpdate = function(hittedBy:string, damage:number) {

                // updates the hitted stack for calculating the assists
                let now = this.game.time.now;
                this.hittedStack.push({name: hittedBy, time: now});
                
                let killed = false;
                let assist = [];

                if ( (this.currentHP - damage) < 0) {
                    this.currentHP = this.maxHP;
                    this.killed = true;

                    // if killed create a new list of assists players
                    for (let i = 0; i < this.hittedStack.length; i++) {
                        if (now - this.hittedStack[i].time > 10000) {
                            if(this.hittedStack[i].name != hittedBy) {
                                assist.push(this.hittedStack[i].name);
                            }
                        }
                    }

                } else {
                    this.currentHP -= damage;
                }

                let message =  {
                    type: MessageType.DAMAGE,
                    name: this.name,
                    hittedBy: hittedBy,
                    killed: this.killed,
                    currentHP: this.currentHP,
                    assist: assist
                };
                this.game.ws.send(message);
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
