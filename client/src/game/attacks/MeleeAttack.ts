/// <reference path="Player.ts" />
/// <reference path="../animations/PlayerAnimationFactory.ts" />

module Rwg {

    export class MeleeAttack {

        public attackName:string;
        public damage:number;
        public range:number;
        public attackSpeed:number;
        public coolDown:number;
        public hitAreaWidth:number;
        public hitAreaHeight:number;
        public framesForTheAnimation: number;
        public singleAnimation: boolean;

        // optional
        private debug:boolean;

        constructor(attackName:string, damage:number, range:number, attackSpeed:number, coolDown:number,
            hitAreaWidth: number, hitAreaHeight: number, activeAttackKey:number, debug:boolean) {
            
            this.attackName = attackName;
            this.damage = damage;
            this.range = range;
            this.attackSpeed = attackSpeed;
            this.coolDown = coolDown;
            this.hitAreaWidth = hitAreaWidth;
            this.hitAreaHeight = hitAreaHeight;
            this.activeAttackKey = activeAttackKey;
            this.debug = debug;
        }

        public provide(game: Phaser.Game, player: Player) {

            // create a new attack in the attack list
            player.attacks[this.attackName] = {};
            player.attacks[this.attackName].attackTime = 0;
            player.attacks[this.attackName].coolDown = this.coolDown;
            player.attacks[this.attackName].damage = this.damage;
            player.attacks[this.attackName].attackSpeed = this.attackSpeed;
            player.attacks[this.attackName].range = this.range;

            // generate the attack hit area sprite
            player.attacks[this.attackName].hitAreaSprite = player.activeAttack.create(0, 0,
                this.createHitAreBmd(game, this.hitAreaWidth, this.hitAreaHeight, this.debug));
            player.attacks[this.attackName].hitAreaSprite.exists = false;
            player.attacks[this.attackName].hitAreaSprite.visible = false;
            player.attacks[this.attackName].hitAreaSprite.origin = {};
            player.attacks[this.attackName].hitAreaSprite.origin.x = this.x;
            player.attacks[this.attackName].hitAreaSprite.origin.y = this.y;
            player.attacks[this.attackName].hitAreaSprite.anchor.set(0.5);
            player.attacks[this.attackName].hitAreaSprite.attackName = this.attackName;

            // generates the method callbacks for the attack
            player.attacks[this.attackName].attack = this.getAttackMethod(this.attackName).bind(player);
            player.attacks[this.attackName].triggerAttack = this.getTriggerAttackMethod(this.attackName).bind(player);
            player.attacks[this.attackName].additionalEffect = null;

            // the method to check the range of the hit area
            player.updateMethods['checkRangeFor'+this.attackName] = this.getCheckRangeForAttackMethod(this.attackName).bind(player);

            // methods for attack base on key activation
            if (this.activeAttackKey == null) {
                player.defaultLeftClickAction = player.attacks[this.attackName].triggerAttack.bind(player);
                player.currentLeftClickAction = player.attacks[this.attackName].triggerAttack.bind(player);
                player.activAction = this.attackName;
            } else {
                let key = game.input.keyboard.addKey(this.activeAttackKey);
                key.onDown.add(this.getAttackSelectedMethod(this.attackName), player);
            }

            // creates the animation method for this attack
            let animationFactory = new PlayerAnimationFactory();
            animationFactory.animId = this.attackName;
            animationFactory.cancelMovement = true;
            animationFactory.framesNumber = this.framesForTheAnimation;
            animationFactory.singleAnimation = this.singleAnimation;

            player.attacks[this.attackName].playAttackAnimationTowards = 
                animationFactory.getPlayAnimationTowardsMethod(player, this.attackSpeed).bind(player);
        }

        private getAttackMethod(attackName:string) {
            return function (message: any) {

                let target = new Phaser.Point(message.targetX, message.targetY);
                let position = new Phaser.Point(message.x, message.y);

                this.changeSightPositionToPoint(target.x, target.y);

                this.attacks[attackName].hitAreaSprite.rotation = this.game.physics.arcade.angleBetween(position, target);
                this.attacks[attackName].hitAreaSprite.reset(position.x , position.y);
                this.attacks[attackName].hitAreaSprite.origin.x = position.x;
                this.attacks[attackName].hitAreaSprite.origin.y = position.y;
                
                //start the animation
                if( this.attacks[attackName].playAttackAnimationTowards != null){
                    this.attacks[attackName].playAttackAnimationTowards(target.x,target.y);
                }

                // the hitArea movement speed will be the distance in pixeles divided by the attackspeed in miliseconds
                // I want to change this to have the hitArea speed calculated different, but base on attackSpeed
                let speed = this.attacks[attackName].range / (this.attacks[attackName].attackSpeed / 1000);
                this.game.physics.arcade.moveToXY(this.attacks[attackName].hitAreaSprite, target.x, target.y, speed);
            }
        }

        private getTriggerAttackMethod(attackName:string) {
            return function() {
                if (this.game.time.now > this.attacks[attackName].attackTime) {
                    
                    let message =  {
                        playerId: this.playerId,
                        attackName: attackName,
                        targetX: this.game.input.worldX,
                        targetY: this.game.input.worldY,
                        x: this.x,
                        y: this.y,
                        type: 'attack',
                        team: this.team
                    };
                    this.game.ws.send(message);
                    this.attacks[attackName].attack(message);

                    this.attacks[attackName].attackTime = this.game.time.now + this.attacks[attackName].coolDown;
                }
            };
        }

        private getCheckRangeForAttackMethod(attackName:string) {
            return function() {
                if (this.attacks[attackName].hitAreaSprite.alive) {
                    if (Phaser.Point.distance(this.attacks[attackName].hitAreaSprite.position,
                            this.attacks[attackName].hitAreaSprite.origin, true) > this.attacks[attackName].range) {

                        this.attacks[attackName].hitAreaSprite.kill();
                    }
                }
            };
        }

        private getAttackSelectedMethod(attackName:string) {
            return function() {
                this.currentLeftClickAction = this.attacks[attackName].triggerAttack;
                this.lastActiveAttack = attackName;
            }
        }

        // creates the hit area bitmapdata
        private createHitAreBmd(game:any, hitAreaWidth: number, hitAreaHeight: number, debug: boolean) {
            let hitAreaBmd = game.add.bitmapData(hitAreaWidth,hitAreaHeight);
            hitAreaBmd.ctx.beginPath();
            hitAreaBmd.ctx.rect(0,0,hitAreaWidth,hitAreaHeight);
            if (debug) {
                hitAreaBmd.ctx.fillStyle = '#ffffff';
                hitAreaBmd.ctx.fill();
            }
            return hitAreaBmd;
        }
    }
}
