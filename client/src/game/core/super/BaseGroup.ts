module Rwg {

    export class BaseGroup extends Phaser.Group {

        constructor(game:Phaser.Game) {
            super(game);
        }

        public getByName(name:string) {
            for (let i = 0; i < this.hash.length ; i++){
                if (name == this.hash[i].name) {
                    return this.hash[i];
                }
            }
            return null;
        }

        public contains(name:string) {
            for (let i = 0; i < this.hash.length ; i++){
                if (name == this.hash[i].name) {
                    return true;
                }
            }
            return null;
        }
    }
}