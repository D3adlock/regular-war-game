/// <reference path="Player.ts" />

module Rwg {

    export class PlayerAnimationFactory {

        public animId:string;
        public cancelMovement:boolean;
        public framesNumber:number;
        public singleAnimation:boolean;

        constructor() {
            this.upFrames = [];
            this.downFrames = [];
            this.leftFrames = [];
            this.rightFrames = [];
        }

        public getPlayAnimationTowardsMethod(player: any, attackSpeed: number) {

            if (this.singleAnimation) {
                for (let i = 0; i < this.framesNumber; i++) {
                    let frameName = this.animId+'UpDownLeftRight'+(i+1)+'.png';
                    this.upFrames.push(frameName);
                    this.downFrames.push(frameName);
                    this.leftFrames.push(frameName);
                    this.rightFrames.push(frameName);
                }
            } else {
                for (let i = 0; i < this.framesNumber; i++) {
                    this.upFrames.push(this.animId+'Up'+(i+1)+'.png');
                    this.downFrames.push(this.animId+'Down'+(i+1)+'.png');
                    this.leftFrames.push(this.animId+'Left'+(i+1)+'.png');
                    this.rightFrames.push(this.animId+'Right'+(i+1)+'.png');
                }
            }

            this.createAnimation(player, attackSpeed, this.upFrames, this.animId+'UpPlayerAnim', this.cancelMovement);
            this.createAnimation(player, attackSpeed, this.downFrames, this.animId+'DownPlayerAnim', this.cancelMovement);
            this.createAnimation(player, attackSpeed, this.leftFrames, this.animId+'LeftPlayerAnim', this.cancelMovement);
            this.createAnimation(player, attackSpeed, this.rightFrames, this.animId+'RightPlayerAnim', this.cancelMovement);

            let animId = this.animId

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
                    if(player.isUserPlayer) {
                        this.continueMovement();
                    }
                    this.changeSightPositionToPoint(this.getPointsBaseOnFrame().x, this.getPointsBaseOnFrame().y)
                },player);
                anim.onStart.add(function() {
                    this.stopMovement();
                },player);
            }
        }
    }
}
