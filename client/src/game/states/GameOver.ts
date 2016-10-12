/// <reference path="../core/enums/MessageType.ts" />
/// <reference path="../characters/CharacterSelecter.ts" />

module Rwg {

    export class GameOver extends Phaser.State {

        private arena:string;
        private player:any;
        private leaderBoard:any;
        private winner:any;
        private cursor:any;

        init(gameover:any){
            this.arena = gameover.arena;
            this.player = gameover.player;
            this.leaderBoard = gameover.leaderBoard;
            this.winner = gameover.winner;
        }

        create() {

            let y  = 10;
            for (let i=0; i < this.leaderBoard.length; i++) {

                let score = this.leaderBoard[i].kill + " / " + this.leaderBoard[i].assist + " / " + this.leaderBoard[i].death;
                this.addContainer(y,score,this.leaderBoard[i].character + ".jpg");
                y += 70;
            }

            this.game.world.setBounds(0, 0, 800,(y+10)*2);

            // movement cursor up
            let up = this.game.input.keyboard.addKey(Phaser.KeyCode.W);
            up.onHoldCallback = function() {
                this.game.camera.y -=4;
            }.bind(this);

            // down
            let down = this.game.input.keyboard.addKey(Phaser.KeyCode.S);
            down.onHoldCallback = function() {
                this.game.camera.y +=4;
            }.bind(this);

            // submit button
            this.game.input.keyboard.removeKeyCapture(13);
            let submit = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            submit.onDown.add(function() {
                
                this.game.input.keyboard.onPressCallback = null;
                this.game.state.start('CharSelection', true, false, {
                    name: this.player.name
                });

            }, this);
        }

        private addContainer(y, score, icon) {
            let container = this.game.add.group();
            container.scale.set(2);
            container.create(100-32, y, 'uiAtlas', 'containerBorderRadiusBegin.png');
            let content = this.add.tileSprite(100, y, 200, 64, 'uiAtlas', 'containerBorderRadius.png');
            container.add(content);
            container.create(100 + 200, y, 'uiAtlas', 'containerBorderRadiusEnd.png');

            let icon = this.game.add.sprite((100 + 5)*2,(y +15)*2, 'charIcons', icon);

            description Text
            let description = this.game.add.group();

            let descriptionText = this.textLine (0,0, score , 16, content.width*2);
            descriptionText.x = Math.floor(content.x + content.width / 2)*2;
            descriptionText.y = Math.floor(content.y + content.height / 2)*2;
            descriptionText.anchor.set(0.5);
            description.add(descriptionText);
        }

        private textLine (x,y, text:string, size:string, wordWrapWidth:number) {
            let font = 12;
            if (size) {
                font = size;
            }

            let text = this.game.add.text(x,y,text,{font:font+"px Arial",fill:"#ffffff",
                wordWrap: true, wordWrapWidth: wordWrapWidth, align: "center"});
            text.stroke = '#000000';
            text.strokeThickness = 2;
            return text;
        }
    }
}
