module Rwg {

    export class PlayersGroup extends Phaser.Group {

        constructor(game: Phaser.Game) {
            super(game);
            this.game.physics.arcade.enable(this);
            this.enableBody = true;
        }

        public getPlayerById(playerId: string) {
            for (let i = 0; i < this.hash.length ; i++){
                if (playerId == this.hash[i].playerId) {
                    return this.hash[i];
                }
            }
            return null;
        }

        public playerIdExists(playerId: string) {
            for (let i = 0; i < this.hash.length ; i++){
                if (playerId == this.hash[i].playerId) {
                    return true;
                }
            }
            return null;
        }
    }
}
