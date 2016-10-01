/// <reference path="../core/factories/CharFactory.ts" />
/// <reference path="../core/enums/AttackTypes.ts" />
/// <reference path="../core/enums/SkillTypes.ts" />
/// <reference path="../core/enums/Teams.ts" />
/// <reference path="../enums/CollisionCategory.ts" />

module Rwg {

    export class TestStage extends Phaser.State {

        private background: any;
        private servermessages: number;
        private chars: any;

        init (initParam: any) {
            this.name = initParam.name;
        }

        create() {

            this.game.renderMethods = {};
            
            let args = {
                game: this.game,
                name: this.name,
                atlasName: 'link2',
                framesPerMovement: 6,
                controlable: true,
                movementSpeed: 300,
                scale: 2.0,
                attacks: [
                    {
                        name: 'sword',
                        damage: 20,
                        range: 25,
                        attackSpeed: 300,
                        hitAreaWidth: 10,
                        hitAreaHeight: 70,
                        debug: true,
                        anim: {
                            framesNumber: 5,
                            prefix: 'sword'
                        }
                    },
                    {
                        name: 'bow',
                        spriteName: 'arrow',
                        damage: 8,
                        range: 600,
                        attackSpeed: 250, 
                        hitAreaWidth: 35,
                        hitAreaHeight: 10,
                        cadence: 2,
                        bulletSpeed: 500,
                        debug: true,
                        anim: {
                            framesNumber: 5,
                            prefix: 'bow'
                        }
                    }
                ],
                attackControls: [
                    {
                        name: 'sword',
                        coolDown: 800,
                        activationKey: Phaser.KeyCode.Q
                    },
                    {
                        name: 'bow',
                        coolDown: 300,
                        activationKey: Phaser.KeyCode.E
                    }
                ],
                skills: [
                    {
                        name: 'testTargetSkill',
                        anim: {
                            frames: ['standLeft.png','standUp.png','standRight.png', 'standDown.png','cast1.png','cast2.png','cast3.png']
                        },
                        castingSpeed: 1500,
                        effect: function(targets) {console.log(targets);}
                    },
                    {
                        name: 'testAreaSkill',
                        anim: {
                            frames: ['standLeft.png','standUp.png','standRight.png', 'standDown.png']
                        },
                        castingSpeed: 800,
                        effect: function(targets) {console.log(targets);}
                    },
                    {
                        name: 'jump',
                        skillReadyIn: 0,
                        anim: {
                            frames: ['standLeft.png','standUp.png','standRight.png', 'standDown.png']
                        },
                        castingSpeed: 300,
                        effect: function(targets) {
                            
                            this.game.physics.arcade.moveToXY(this, targets.x, targets.y, null, 300 - 20);
                            this.game.time.events.add(300 - 20,
                                function(){
                                    this.stopMovement();
                                }
                            ,this);
                        }
                    }
                ],
                skillControls: [
                    {
                        type: SkillTypes.TARGET,
                        name: 'testTargetSkill',
                        range: 300,
                        coolDown: 2000,
                        castKey: Phaser.KeyCode.X,
                        maxTargetsSelected: 2,
                        targetOnAlly: false
                    },
                    {
                        type: SkillTypes.AREA,
                        name: 'testAreaSkill',
                        range: 300,
                        coolDown: 1500,
                        castKey: Phaser.KeyCode.V
                    },
                    {
                        type: SkillTypes.AREA,
                        name: 'jump',
                        range: 400,
                        coolDown: 600,
                        castKey: Phaser.KeyCode.C
                    }
                ]
            }

            this.game.player = CharFactory.getChar(args);
            this.game.player.body.setCollisionMask(CollisionCategory.WALL | CollisionCategory.ATTACK);
            this.game.player.body.setCollisionCategory(CollisionCategory.USER_PLAYER);
            this.game.player.attackMask = CollisionCategory.CHAR | CollisionCategory.WALL;
            this.game.player.attackCollision = CollisionCategory.CHAR;


/*
*
*
*/



            this.game.ws.move = this.move.bind(this);
            this.game.ws.velocity = this.velocity.bind(this);
            this.game.ws.attack = this.attack.bind(this);
            this.game.ws.skill = this.skill.bind(this);

            this.game.camera.follow(this.game.player);
            this.game.stage.disableVisibilityChange = true;
            this.chars = {};

            this.game.map = this.game.add.tilemap('forestTownJSON');
            this.game.map.addTilesetImage('forestTown', 'forestTownImage');
            let ground = this.game.map.createLayer('ground');
            let obstacules = this.game.map.createLayer('obstacules');
            let over = this.game.map.createLayer('over');
            ground.resizeWorld();
            obstacules.sendToBack();
            ground.sendToBack();

            this.game.physics.box2d.setBoundsToWorld();

            //creates the obstacules
            this.sprite = this.game.add.sprite(this.game.map.collision.Collition[0].x,
            this.game.map.collision.Collition[0].y);  

            this.game.physics.box2d.enable(this.sprite);
            
            let vertices = [];
            for (let i = 1; i < this.game.map.collision.Collition[0].polyline.length; i++) {
                vertices.push(this.game.map.collision.Collition[0].polyline[i][0]);
                vertices.push(this.game.map.collision.Collition[0].polyline[i][1]);
            }

            this.sprite.body.setPolygon(vertices);
            this.sprite.body.static = true;
            this.sprite.body.setCollisionCategory(CollisionCategory.WALL);

            // render methods
            this.game.renderMethods['debugTheObject'] = function() {
                this.game.debug.body(this.sprite);
            }.bind(this);
        }

        render () {
            if (this.game.someFoe) {
                this.game.debug.text(this.game.someFoe.body.linearDamping, 100, 100);
            }

            for (var key in this.game.renderMethods) {
                this.game.renderMethods[key]();
            }
        }

        private newPlayer(message:any) {

            let args = {
                game: this.game,
                name: message.name,
                atlasName: 'link2',
                framesPerMovement: 6,
                scale: 2.0,
                canAttack: true,
                attack: true,
                movementSpeed: 300,
                targetable: this.game.player.canTarget,
                 attacks: [
                    {
                        name: 'sword',
                        damage: 20,
                        range: 25,
                        attackSpeed: 300,
                        hitAreaWidth: 10,
                        hitAreaHeight: 70,
                        debug: true,
                        anim: {
                            framesNumber: 5,
                            prefix: 'sword'
                        }
                    },
                    {
                        name: 'bow',
                        spriteName: 'arrow',
                        damage: 8,
                        range: 600,
                        attackSpeed: 250, 
                        hitAreaWidth: 35,
                        hitAreaHeight: 10,
                        cadence: 2,
                        bulletSpeed: 500,
                        debug: true,
                        anim: {
                            framesNumber: 5,
                            prefix: 'bow'
                        }
                    }
                ],
                skills: [
                    {
                        name: 'testTargetSkill',
                        anim: {
                            frames:  ['standLeft.png','standUp.png','standRight.png', 'standDown.png','cast1.png','cast2.png','cast3.png']
                        },
                        castingSpeed: '1500',
                        effect: function(targets) {console.log(targets);}
                    },
                    {
                        name: 'testAreaSkill',
                        anim: {
                            frames: ['standLeft.png','standUp.png','standRight.png', 'standDown.png']
                        },
                        castingSpeed: '800',
                        effect: function(targets) {console.log(targets);}
                    },
                    {
                        name: 'jump',
                        skillReadyIn: 0,
                        anim: {
                            frames: ['standLeft.png','standUp.png','standRight.png', 'standDown.png']
                        },
                        castingSpeed: 300,
                        effect: function(targets) {
                            
                            this.game.physics.arcade.moveToXY(this, targets.x, targets.y, null, 300);
                            this.game.time.events.add(300,
                                function(){
                                    this.stopMovement();
                                }
                            ,this);
                        }
                    }
                ]
            }

            this.chars[message.name] = CharFactory.getChar(args);
            this.chars[message.name].body.setCollisionCategory(CollisionCategory.CHAR);
            this.chars[message.name].attackMask = CollisionCategory.USER_PLAYER | CollisionCategory.WALL;
            this.chars[message.name].attackCollision = CollisionCategory.USER_PLAYER;

            let array = this.game.physics.box2d.getBodies();
            for ( i = 0; i < array.length;i++) {
                if (array[i].parent.sprite) {
                    console.log(array[i].parent.sprite.body);
                }
            }
        }

        public move(message: any) {
            if (this.game.player.name == message.name) {
                return;
            }

            if (this.chars[message.name]) {
                this.chars[message.name].moveCharacterToXY(message.x, message.y);
            } else {
                this.newPlayer(message);
            }
        }

        public velocity(message: any) {
            if (this.game.player.name == message.name) {
                return;
            }

            if (this.chars[message.name]) {
                this.chars[message.name].setVelocity(message.x, message.y, message.positionX, message.positionY);
            } else {
                this.newPlayer(message);
            }
        }

        public attack(message: any) {
            if (this.game.player.name == message.name) {
                return;
            }

            if (this.chars[message.name]) {
                this.chars[message.name].attacks[message.attackName].attack(message);
            }
        }

        public skill(message: any) {
            if (this.game.player.name == message.name) {
                return;
            }

            if (this.chars[message.name]) {
                this.chars[message.name].skills[message.skillName].skillThrown(message);
            }
        }
    }
}
