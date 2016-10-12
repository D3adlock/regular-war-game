/// <reference path="../factories/CharAnimFactory.ts" />
/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enums/CollisionCategory.ts" />

module Rwg {

    export class AttackProvider {

        private name:string;
        private damage:number;
        private range:number;
        private attackSpeed:number;
        private hitAreaWidth:number;
        private hitAreaHeight:number;
        private anim:any;
        private spriteName:string;
        private cadence:number;
        private bulletSpeed:number;
        private debug:boolean;

        constructor(args:any) {

            this.name = args.name;
            this.damage = args.damage;
            this.range = args.range;
            this.attackSpeed = args.attackSpeed;
            this.hitAreaWidth = args.hitAreaWidth;
            this.hitAreaHeight = args.hitAreaHeight;
            this.debug = args.debug;
            this.anim = args.anim;
            this.spriteName = args.spriteName;
            this.bulletSpeed = args.bulletSpeed;
            this.cadence = args.cadence;

        }

        public provide(game:Phaser.Game, character:BaseChar) {

            // create a new attack in the attack list
            character.attacks[this.name] = {};
            character.attacks[this.name].damage = this.damage;
            character.attacks[this.name].attackSpeed = this.attackSpeed;
            character.attacks[this.name].range = this.range;
            character.attacks[this.name].hitAreaWidth = this.hitAreaWidth;
            character.attacks[this.name].hitAreaHeight = this.hitAreaHeight;
            character.attacks[this.name].spriteName = this.spriteName;
            character.attacks[this.name].bulletSpeed = this.bulletSpeed;
            character.attacks[this.name].name = this.name;

            // if cadence defined
            character.attacks[this.name].cadence = 1;
            if (this.cadence) {character.attacks[this.name].cadence = this.cadence;}
            character.attacks[this.name].created = game.add.group();

            // this is an empty method to store an additional trigger behaviour like the skill icon or the casting bar
            character.attacks[this.name].additionalOnTriggerCallBack = function(){};

            // method to create a new sprite hit area every time the hit is triggered
            character.attacks[this.name].createNewHitArea = this.getCreateSpriteHitAreaMethod(this.name).bind(character);

            // generates the method callbacks for the attack
            character.attacks[this.name].attack = this.getAttackMethod(this.name).bind(character);

            // the method to check the range of the hit area
            character.updateMethods['checkRangeFor'+this.name] = 
                this.getCheckRangeForAttackMethod(this.name).bind(character);

            // creates the animation method for this attack
            let animationFactory = new CharAnimFactory(this.anim);
            character.attacks[this.name].playAttackAnimationTowards = 
                animationFactory.getPlayAnimationTowardsMethod(this.name, character, this.attackSpeed).bind(character);

            // debug the hit area
            let name = this.name;
            if (this.debug) {
                game.renderMethods['debug-'+this.name+character.name] = function() {             
                    
                    this.attacks[name].created.forEach(
                        function(member) { 
                            if (member) {
                                this.game.debug.body(member);
                            }
                        }
                    , this, true);

                }.bind(character);
            }
        }

        private getAttackMethod(attackName:string) {
            return function (message: any) {

                let target = new Phaser.Point(message.targetX, message.targetY);
                let position = new Phaser.Point(message.x, message.y);

                // fix the character position and stop movement
                this.moveCharacterToXY(position.x, position.y);

                // creates a new hit area
                let hitAreaSprite = this.attacks[attackName].createNewHitArea(position, target);

                //start the animation
                if( this.attacks[attackName].playAttackAnimationTowards != null){
                    this.attacks[attackName].playAttackAnimationTowards(target.x,target.y);
                }

                // the hitArea movement speed will be the distance in pixeles divided by the attackspeed in miliseconds
                // I want to change this to have the hitArea speed calculated different, but base on attackSpeed
                let speed = this.attacks[attackName].range / (this.attacks[attackName].attackSpeed / 1000);

                this.attacks[attackName].additionalOnTriggerCallBack();
                
                // if it is a bullet the speed will be the bullet speed
                if (this.attacks[attackName].bulletSpeed) { speed = this.attacks[attackName].bulletSpeed;}
                this.game.physics.arcade.moveToXY(hitAreaSprite, target.x, target.y, speed);
            }
        }


        private getCreateSpriteHitAreaMethod(attackName:string) {
            return function(position, target) {         
                // generate the attack hit area sprite
                let hitAreaSprite = this.attacks[attackName].created.create(0, 0, this.attacks[attackName].spriteName);

                hitAreaSprite.exists = false;
                hitAreaSprite.visible = false;
                hitAreaSprite.origin = {};
                hitAreaSprite.attackName = attackName;

                // creates the box2D physics
                this.game.physics.box2d.enable(hitAreaSprite);
                hitAreaSprite.body.fixedRotation = true;
                hitAreaSprite.body.clearFixtures();

                hitAreaSprite.reset(position.x , position.y);
                hitAreaSprite.body.setRectangle(this.attacks[attackName].hitAreaWidth, 
                    this.attacks[attackName].hitAreaHeight);
                hitAreaSprite.body.rotation = this.game.physics.arcade.angleBetween(position, target);
                hitAreaSprite.origin.x = position.x;
                hitAreaSprite.origin.y = position.y;
                hitAreaSprite.body.collideWorldBounds = false;

                hitAreaSprite.body.setCollisionCategory(CollisionCategory.ATTACK);
                hitAreaSprite.body.setCollisionMask(this.attackMask);
                hitAreaSprite.body.sensor = true;

                hitAreaSprite.body.setCategoryContactCallback(CollisionCategory.WALL, 
                    function(attackBody) {
                        if (attackBody.sprite) {
                            attackBody.sprite.destroy();
                        }
                    }
                , this);

                let damage = this.attacks[attackName].damage;
                hitAreaSprite.body.setCategoryContactCallback(this.attackCollision, 
                    function(attackBody, attackedBody) {
                        if (attackBody.sprite) {
                            attackBody.sprite.destroy();
                            if (attackedBody.sprite.sendDamageUpdate) {
                                this.game.state.getCurrentState().player.sendDamageUpdate(this.name, damage);
                            }
                        }
                    }
                , this);

                return hitAreaSprite;
            };
        }

        private getCheckRangeForAttackMethod(attackName:string) {
            return function() {
                this.attacks[attackName].created.forEach(
                    function(member, range) { 
                        if (member.alive) {
                            if (Phaser.Point.distance(member.position, member.origin, true) > range) {
                                member.destroy();
                            }
                        }
                    }
                , this, true, this.attacks[attackName].range);
            };
        }
    }
}
