module Rwg {

    export class Link {

        public base = 
        {
            atlasName: 'link2',
            framesPerMovement: 6,
            movementSpeed: 300,
            scale: 2.0,
            dinamicMass: 20,
            staticMass: 150,
            health: {
                maxHP: 50,
                regenHPperSec: 0.08,
                maxMP: 50,
                regenMPperSec: 0.08
            },
            attacks: [
                {
                    name: 'sword',
                    damage: 20,
                    range: 25,
                    attackSpeed: 300,
                    hitAreaWidth: 10,
                    hitAreaHeight: 70,
                    debug: false,
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
                    debug: false,
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
                    castingSpeed: '3000',
                    skillReadyIn: 0.5,
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
            ]
        };

        public attackControls = 
        [
            {
                name: 'sword',
                coolDown: 800,
                activationKey: Phaser.KeyCode.ONE,
                icon: 'sword.png'
            },
            {
                name: 'bow',
                coolDown: 300,
                activationKey: Phaser.KeyCode.TWO,
                icon: 'bow.png'
            }
        ];

        public skillControls =
        [
            {
                type: SkillTypes.TARGET,
                name: 'testTargetSkill',
                range: 300,
                coolDown: 2000,
                activationKey: Phaser.KeyCode.THREE,
                maxTargetsSelected: 2,
                targetOnAlly: false,
                icon: 'powerStrike.png'
            },
            {
                type: SkillTypes.AREA,
                name: 'testAreaSkill',
                range: 300,
                coolDown: 6000,
                activationKey: Phaser.KeyCode.FOUR,
                icon: 'fireBall.png'
            },
            {
                type: SkillTypes.AREA,
                name: 'jump',
                range: 400,
                coolDown: 600,
                activationKey: Phaser.KeyCode.FIVE,
                icon: 'agility.png'
            }
        ];
    }
}