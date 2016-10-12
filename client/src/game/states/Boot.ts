module Rwg {

    export class Boot extends Phaser.State {

        preload() {
            this.game.load.atlas('link2', '../assets/link2.png', '../assets/link2.json');
            this.game.load.atlas('uiAtlas', '../assets/uiAtlas.png', '../assets/uiAtlas.json');
            this.game.load.atlas('charIcons', '../assets/charIcons.png', '../assets/charIcons.json');
            this.game.load.atlas('arenaIcons', '../assets/arenaIcons.png', '../assets/arenaIcons.json');

            this.game.load.image('background', '../assets/background.png');

            this.game.load.spritesheet('arrow', '../assets/arrow.png', 32, 10, 1);
            this.game.load.spritesheet('target', '../assets/target.png', 48, 48, 1);

            this.game.load.tilemap('forestTownJSON', '../assets/forestTown.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('forestTownImage', '../assets/forestTown.png');
        }

        create() {
            this.game.physics.startSystem(Phaser.Physics.BOX2D);

            this.game.state.start('EnterName', true, false);
            
            // this.game.state.start('GameOver', true, false);
        }
    }
}
