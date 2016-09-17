/// <reference path="Player.ts" />

module Rwg {

    export class WeaponAnimations {

        constructor(upFrames:any, downFrames:any, leftFrames:any, rightFrames:any) {
            this.upFrames = upFrames;
            this.downFrames = downFrames;
            this.leftFrames = leftFrames;
            this.rightFrames = rightFrames;
        }

        public provide(game: Phaser.Game, player: Player) {
            player.addWeaponAnim = this.addWeaponAnim.bind(player);
            player.playWeaponAnimationTowards = this.playWeaponAnimationTowards.bind(player);

            player.addWeaponAnim(this.upFrames, 'UpAttack');
            player.addWeaponAnim(this.downFrames, 'DownAttack');
            player.addWeaponAnim(this.leftFrames, 'LeftAttack');
            player.addWeaponAnim(this.rightFrames, 'RightAttack');
        }

        private addWeaponAnim(animFrames:any, animId:string) {
            // the weapon speed will determin how long the animation attack will last
            let fps = Math.floor(animFrames.length / (this.weapon.attackSpeed/1000));
            // anim creation
            let anim = this.animations.add(this.weapon.weaponName+animId,animFrames, fps, false);
            // set cancel movement
            anim.onComplete.add(function() {
                this.continueMovement();
            },this);
        }

        private playWeaponAnimationTowards(x:number,y:number){

            switch(this.getSightPositionToPoint(x, y)) {
                case this.FacePositions.RIGHT:
                    this.play(this.weapon.weaponName+'RightAttack');
                    break;
                case this.FacePositions.LEFT:
                    this.play(this.weapon.weaponName+'LeftAttack');
                    break;
                case this.FacePositions.UP:
                    this.play(this.weapon.weaponName+'UpAttack');
                    break;
                case this.FacePositions.DOWN:
                    this.play(this.weapon.weaponName+'DownAttack');
            }
        }
    }
}
