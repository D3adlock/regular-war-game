/// <reference path="Player.ts" />

module Rwg {

    export class MeleeWeapon {

        private weaponName:string;
        private damage:number;
        private range:number;
        private attackSpeed:number;
        private coolDown:number;
        private hitAreaWidth:number;
        private hitAreaHeight:number;

        // optional
        private debug:boolean;

        constructor(weaponName:string, damage:number, range:number, attackSpeed:number, coolDown:number,
            hitAreaWidth: number, hitAreaHeight: number, debug:boolean) {
            
            this.weaponName = weaponName;

            this.damage = damage;
            this.range = range;
            this.attackSpeed = attackSpeed;
            this.coolDown = coolDown;

            this.hitAreaWidth = hitAreaWidth;
            this.hitAreaHeight = hitAreaHeight;

            this.debug = debug;
        }

        public provide(game: Phaser.Game, player: Player) {
            player.attackTime = 0;

            player.weapon.weaponName = this.weaponName;
            player.weapon.coolDown = this.coolDown;
            player.weapon.damage = this.damage;
            player.weapon.attackSpeed = this.attackSpeed;
            player.weapon.range = this.range;

            player.initWeapon = this.initWeapon.bind(player);
            player.hitUserPlayer = this.hitUserPlayer.bind(player);
            player.hitAFoe = this.hitAFoe.bind(player);
            player.triggerAttack = this.triggerAttack.bind(player);
            player.attack = this.attack.bind(player);

            player.initWeapon(this.hitAreaWidth, this.hitAreaHeight, this.debug);
        }

        private initWeapon(hitAreaWidth:number,hitAreaHeight:number,debug:boolean) {

            // the bitmapData of the hitArea
            let hitAreaBmd = this.game.add.bitmapData(hitAreaWidth,hitAreaHeight);
            hitAreaBmd.ctx.beginPath();
            hitAreaBmd.ctx.rect(0,0,hitAreaWidth,hitAreaHeight);
            if (debug) {
                hitAreaBmd.ctx.fillStyle = '#ffffff';
                hitAreaBmd.ctx.fill();
            }

             // the sprite of the hitArea
            this.hitAreaSprite = this.weapon.create(0, 0, hitAreaBmd);
            this.hitAreaSprite.exists = false;
            this.hitAreaSprite.visible = false;

            this.hitAreaSprite.origin = {};
            this.hitAreaSprite.origin.x = this.x;
            this.hitAreaSprite.origin.y = this.y;
            this.hitAreaSprite.anchor.set(0.5);

            this.updateMethods['checkRangeFor'+this.weapon.weaponName] = function() {
                if (this.hitAreaSprite.alive) {
                    if (Phaser.Point.distance(this.hitAreaSprite.position, this.hitAreaSprite.origin, true) > this.weapon.range) {
                        this.hitAreaSprite.kill();
                    }
                }
            }.bind(this);
        }

        private hitUserPlayer(userPlayer, hitArea) {
            userPlayer.takeHit(this.weapon.damage, this.playerId);
            hitArea.kill();
        }

        private hitAFoe(hitArea, foePlayer) {
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

            let target = new Phaser.Point(message.targetX, message.targetY);
            let position = new Phaser.Point(message.x, message.y);

            this.changeSightPositionToPoint(target.x, target.y);

            this.hitAreaSprite.rotation = this.game.physics.arcade.angleBetween(position, target);
            this.hitAreaSprite.reset(position.x , position.y);
            this.hitAreaSprite.origin.x = position.x;
            this.hitAreaSprite.origin.y = position.y;
            
            //start the animation
            if(this.playWeaponAnimationTowards){
                this.playWeaponAnimationTowards(target.x,target.y);
                this.stopMovement(position.x,position.y);
            }

            // the hitArea movement speed will be the distance in pixeles divided by the attackspeed in miliseconds
            // I want to change this to have the hitArea speed calculated different, but base on attackSpeed
            let speed = this.weapon.range / (this.weapon.attackSpeed / 1000);
            this.game.physics.arcade.moveToXY(this.hitAreaSprite, target.x, target.y, speed);
        }
    }
}
