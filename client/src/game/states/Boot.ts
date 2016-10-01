module Rwg {

    export class Boot extends Phaser.State {

        preload() {
            this.game.load.atlas('link2', '../assets/link2.png', '../assets/link2.json');
            this.game.load.image('background','../assets/debug-grid-1920x1920.png');
            this.game.load.spritesheet('arrow', '../assets/arrow.png', 32, 10, 1);
            this.game.load.spritesheet('target', '../assets/target.png', 48, 48, 1);

            this.game.load.tilemap('desert2TiledJson', '../assets/desert2.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('desert', '../assets/desert.png');

            this.game.load.tilemap('forestTileSetData', '../assets/forest.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('forestTileImage', '../assets/forest.png');

            this.game.load.tilemap('forestTownJSON', '../assets/forestTown.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('forestTownImage', '../assets/forestTown.png');
        }

        create() {
            this.game.physics.startSystem(Phaser.Physics.BOX2D);

            this.game.state.start('EnterName', true, false);
        }
    }
}
