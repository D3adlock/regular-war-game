/// <reference path="Player.ts" />

module Rwg {

    export class RangedWeapon {

        private weaponName:string;
        private damage:number;
        private range:number;
        private attackSpeed:number;
        private coolDown:number;
        private hitAreaWidth:number;
        private hitAreaHeight:number;
        private cadence:number;
        private bulletSpeed:number;

        // optional
        private debug:boolean;

        constructor(weaponName:string, damage:number, range:number, attackSpeed:number, coolDown:number,
            cadence: number, bulletSpeed: number, hitAreaWidth: number, hitAreaHeight: number, debug:boolean) {
            
            this.weaponName = weaponName;

            this.damage = damage;
            this.range = range;
            this.attackSpeed = attackSpeed;
            this.coolDown = coolDown;
            this.cadence = cadence;
            this.bulletSpeed = bulletSpeed;

            this.hitAreaWidth = hitAreaWidth;
            this.hitAreaHeight = hitAreaHeight;

            this.debug = debug;
        }

        public provide(game: Phaser.Game, player: Player) {
            player.weapon.coolDown = this.coolDown;
            player.weapon.damage = this.damage;
            player.weapon.range = this.range;
            player.weapon.attackSpeed = this.attackSpeed;
            player.weapon.cadence = this.cadence;
            player.weapon.bulletSpeed = this.bulletSpeed;

            player.initWeapon = this.initWeapon.bind(player);
            player.hitUserPlayer = this.hitUserPlayer.bind(player);
            player.hitAFoe = this.hitAFoe.bind(player);
            player.triggerAttack = this.triggerAttack.bind(player);
            player.attack = this.attack.bind(player);

            player.initWeapon(this.hitAreaWidth, this.hitAreaHeight, this.debug);
        }

        private initWeapon(hitAreaWidth:number, hitAreaHeight:number, debug:boolean) {
            for (let i = 0; i < this.weapon.cadence; i++){

                // 5, 30
                let hitAreaBmd = this.game.add.bitmapData(hitAreaWidth,hitAreaHeight);
                hitAreaBmd.ctx.beginPath();
                hitAreaBmd.ctx.rect(0,0,hitAreaWidth,hitAreaHeight);
                if (debug){
                    hitAreaBmd.ctx.fillStyle = '#'+Math.floor(Math.random()*16777215).toString(16);
                    hitAreaBmd.ctx.fill();
                }

                let hitAreaSprite = this.weapon.create(0, 0, hitAreaBmd);
                hitAreaSprite.exists = false;
                hitAreaSprite.visible = false;
                hitAreaSprite.checkWorldBounds = true;
                hitAreaSprite.events.onOutOfBounds.add( function (hitArea) { hitArea.kill(); }, this);
                hitAreaSprite.origin = {};
            }

            // this update method will check the distance of a bullet
            this.updateMethods['checkRangeFor'+this.weapon.weaponName] = function() {
                this.weapon.forEach(
                    function(member, range) { 
                        if (member.alive) {
                            if (Phaser.Point.distance(member.position, member.origin, true) > range) {
                                member.kill();
                            }
                        }
                    }
                , this, true, this.weapon.range);
            }.bind(this);
        }

        private hitUserPlayer(userPlayer, hitArea) {
            userPlayer.takeHit(this.weapon.damage, this.playerId);
            hitArea.kill();
        }

        private hitAFoe(hitArea) {
            hitArea.kill();
        }

        private triggerAttack() {
            let message =  {
                playerId: this.playerId,
                targetX: this.game.input.worldX,
                targetY: this.game.input.worldY,
                x: this.x,
                y: this.y,
                type: 'attack',
                team: this.team
            };
            this.game.ws.send(message);
        }

        private attack(message: any) {
            let hitAreaSprite = this.weapon.getFirstExists(false);
            if (hitAreaSprite) {

                let point = new Phaser.Point(message.targetX, message.targetY);
                this.changeSightPositionToPoint(message.targetX, message.targetY);
                
                // set the bullet position
                hitAreaSprite.rotation = this.game.physics.arcade.angleBetween(this.position, point);
                hitAreaSprite.reset(message.x , message.y);
                hitAreaSprite.anchor.set(0.5);

                // set the proyectle origin in the current position
                hitAreaSprite.origin.x = message.x;
                hitAreaSprite.origin.y = message.y;

                // play the attack animation if any
                if(this.playWeaponAnimationTowards) {
                    this.playWeaponAnimationTowards(message.targetX,message.targetY);
                    // start animation cancels the movement
                    this.stopMovement(message.x,message.y);
                }

                this.game.physics.arcade.moveToXY(hitAreaSprite, point.x, point.y, this.weapon.bulletSpeed);
            }
        }
    }
}
