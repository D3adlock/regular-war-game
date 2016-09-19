/// <reference path="Player.ts" />
/// <reference path="../animations/PlayerAnimationFactory.ts" />

module Rwg {

    export class RangedAttack {

        public attackName:string;
        public bulletSpriteName:string;
        public damage:number;
        public range:number;
        public attackSpeed:number;
        public coolDown:number;
        public hitAreaWidth:number;
        public hitAreaHeight:number;
        public cadence:number;
        public bulletSpeed:number;
        public singleAnimation:boolean;

        public framesForTheAnimation;

        public provide(game: Phaser.Game, player: Player) {

            // create a new attack in the attack list
            player.attacks[this.attackName] = {};
            player.attacks[this.attackName].attackTime = 0;
            player.attacks[this.attackName].coolDown = this.coolDown;
            player.attacks[this.attackName].damage = this.damage;
            player.attacks[this.attackName].attackSpeed = this.attackSpeed;
            player.attacks[this.attackName].range = this.range;
            player.attacks[this.attackName].bulletSpeed = this.bulletSpeed;

            // generate the attack hit area sprites
            for (let i = 0; i < this.cadence; i++){
                let bullet = player.activeAttack.create(0, 0, this.bulletSpriteName);
                bullet.exists = false;
                bullet.visible = false;
                bullet.origin = {};
                bullet.origin.x = this.x;
                bullet.origin.y = this.y;
                bullet.anchor.set(0.5);
                bullet.attackName = this.attackName;
            }

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

                let hitAreaSprite = this.activeAttack.next();
                while(hitAreaSprite.attackName != attackName){
                    hitAreaSprite = this.activeAttack.next();
                }

                if (hitAreaSprite) {
                    hitAreaSprite.rotation = this.game.physics.arcade.angleBetween(position, target);
                    hitAreaSprite.reset(position.x , position.y);
                    hitAreaSprite.origin.x = position.x;
                    hitAreaSprite.origin.y = position.y;
                    
                    //start the animation
                    if( this.attacks[attackName].playAttackAnimationTowards != null){
                        this.attacks[attackName].playAttackAnimationTowards(target.x,target.y);
                    }

                    this.game.physics.arcade.moveToXY(hitAreaSprite, target.x, target.y, this.attacks[attackName].bulletSpeed);
                }
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
                this.activeAttack.forEach(
                    function(member, range) { 
                        if (member.alive && member.attackName == attackName) {
                            if (Phaser.Point.distance(member.position, member.origin, true) > range) {
                                member.kill();
                            }
                        }
                    }
                , this, true, this.attacks[attackName].range);
            };
        }

        private getAttackSelectedMethod(attackName:string) {
            return function() {
                this.currentLeftClickAction = this.attacks[attackName].triggerAttack;
                this.lastActiveAttack = attackName;
            }
        }
    }
}
