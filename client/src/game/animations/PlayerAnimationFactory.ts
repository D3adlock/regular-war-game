/// <reference path="Player.ts" />

module Rwg {

    export class PlayerAnimationFactory {

        constructor(animId:string, cancelMovement:boolean, upFrames:any, downFrames:any, leftFrames:any, rightFrames:any) {
            this.animId = animId;
            this.cancelMovement = cancelMovement;
            this.upFrames = upFrames;
            this.downFrames = downFrames;
            this.leftFrames = leftFrames;
            this.rightFrames = rightFrames;
        }

        public getPlayAnimationTowardsMethod(player: any, attackSpeed: number) {

            let animId = this.animId;

            this.createAnimation(player, attackSpeed, this.upFrames, animId+'UpPlayerAnim', this.cancelMovement);
            this.createAnimation(player, attackSpeed, this.downFrames, animId+'DownPlayerAnim', this.cancelMovement);
            this.createAnimation(player, attackSpeed, this.leftFrames, animId+'LeftPlayerAnim', this.cancelMovement);
            this.createAnimation(player, attackSpeed, this.rightFrames, animId+'RightPlayerAnim', this.cancelMovement);

            return function(x:number, y:number) {
                switch(this.getSightPositionToPoint(x, y)) {
                    case this.FacePositions.RIGHT:
                        this.play(animId+'RightPlayerAnim');
                        break;
                    case this.FacePositions.LEFT:
                        this.play(animId+'LeftPlayerAnim');
                        break;
                    case this.FacePositions.UP:
                        this.play(animId+'UpPlayerAnim');
                        break;
                    case this.FacePositions.DOWN:
                        this.play(animId+'DownPlayerAnim');
                }
            }
        }

        private createAnimation(player: any, attackSpeed: number , animFrames:any, subAnimId:string, cancelMovement: boolean) {
            let fps = Math.floor(animFrames.length / (attackSpeed/1000));
            let anim = player.animations.add(subAnimId, animFrames, fps, false);
            // set cancel movement
            if (cancelMovement) {
                anim.onComplete.add(function() {
                    this.continueMovement();
                },player);
                anim.onStart.add(function() {
                    this.stopMovement();
                },player);
            }
        }
    }
}
