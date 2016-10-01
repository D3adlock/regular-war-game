/// <reference path="../base/BaseChar.ts" />
/// <reference path="../enums/FacingPositions.ts" />

module Rwg {

    export class CharAnimFactory {

        private prefix:string;
        private framesNumber:number;
        private frames:any;

        constructor(args:any) {

            this.prefix = args.prefix;
            this.frames = args.frames;
            this.framesNumber = args.framesNumber;

            this.upFrames = [];
            this.downFrames = [];
            this.leftFrames = [];
            this.rightFrames = [];
        }

        public getPlayAnimationTowardsMethod(animId:string, character:BaseChar, attackSpeed: number) {

            if (this.prefix) {
                return this.getMultipleAnimationMethod(animId, character , attackSpeed);
            } else {
                return this.getSinlgeAnimationMethod(animId, character , attackSpeed)
            }
        }

        private getSinlgeAnimationMethod(animId:string, character:BaseChar , attackSpeed: number) {

            this.createAnimation(character, attackSpeed, this.frames, animId);

            return function(x:number, y:number) {
                this.play(animId);
            }
        }

        private getMultipleAnimationMethod(animId:string, character:BaseChar , attackSpeed: number) {

            for (let i = 0; i < this.framesNumber; i++) {
                this.upFrames.push(this.prefix+'Up'+(i+1)+'.png');
                this.downFrames.push(this.prefix+'Down'+(i+1)+'.png');
                this.leftFrames.push(this.prefix+'Left'+(i+1)+'.png');
                this.rightFrames.push(this.prefix+'Right'+(i+1)+'.png');
            }

            this.createAnimation(character, attackSpeed, this.upFrames, animId+'UpCharAnim');
            this.createAnimation(character, attackSpeed, this.downFrames, animId+'DownCharAnim');
            this.createAnimation(character, attackSpeed, this.leftFrames, animId+'LeftCharAnim');
            this.createAnimation(character, attackSpeed, this.rightFrames, animId+'RightCharAnim');

            return function(x:number, y:number) {
                switch(this.getFacingBaseOnPoint(x, y)) {
                    case FacingPositions.RIGHT:
                        this.play(animId+'RightCharAnim');
                        break;
                    case FacingPositions.LEFT:
                        this.play(animId+'LeftCharAnim');
                        break;
                    case FacingPositions.UP:
                        this.play(animId+'UpCharAnim');
                        break;
                    case FacingPositions.DOWN:
                        this.play(animId+'DownCharAnim');
                }
            }
        }

        private createAnimation(character:BaseChar, attackSpeed: number , animFrames:any, subAnimId:string) {
            let fps = Math.floor(animFrames.length / (attackSpeed/1000));
            let anim = character.animations.add(subAnimId, animFrames, fps, false);
            anim.onComplete.add(function() { this.changeFacingBaseOnFrame();},character);
        }
    }
}
