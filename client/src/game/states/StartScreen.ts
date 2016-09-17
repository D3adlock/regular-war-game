module Rwg {

    export class StartScreen extends Phaser.State {

        private textInput: Phaser.bitmapText;
        private instructions: Phaser.bitmapText;
        private error: Phaser.bitmapText;

        private fightType: string;
        private meleeSprite: Phaser.Sprite;
        private rangedSprite: Phaser.Sprite;

        private team: string;
        private teamOne: Phaser.Sprite;
        private teamTwo: Phaser.Sprite;


        preload() {
            this.game.load.spritesheet('sword', '../assets/sword.png', 49, 27, 5);
            this.game.load.spritesheet('swordFighter', '../assets/swordFighter.png', 32, 48, 16);
            this.game.load.spritesheet('meleeType', '../assets/melee.png',200,200);
            this.game.load.spritesheet('rangedType', '../assets/ranged.png',200,200);
            this.game.load.image('background','../assets/debug-grid-1920x1920.png');
        }

        create() {
            var style = { font: "16px Arial", fill: "#ffffff", align: "center"};
            this.instructions = this.game.add.text(50, 50, 'write your player name, submit with ENTER : ', style);
            this.textInput = this.game.add.text(50, 100, '', style);

            // class selection sprites
            this.meleeSprite = this.game.add.sprite(550,20, 'meleeType');
            this.meleeSprite.alpha = 0.5;
            this.meleeSprite.inputEnabled = true;
            this.meleeSprite.selected = false;

            this.rangedSprite = this.game.add.sprite(550,260, 'rangedType');
            this.rangedSprite.alpha = 0.5;
            this.rangedSprite.inputEnabled = true;
            this.rangedSprite.selected = false;

            // team selection sprites
            let teamOneBmd = this.game.add.bitmapData(50,50);
            teamOneBmd.ctx.rect(0,0,50,50);
            teamOneBmd.ctx.fillStyle = '#ff0000';
            teamOneBmd.ctx.fill();
            this.teamOne = this.game.add.sprite(550,490, teamOneBmd);
            this.teamOne.alpha = 0.5;
            this.teamOne.inputEnabled = true;
            this.teamOne.selected = false;
            let styleTeamOne = { font: "32px Arial", fill: "#ffffff", align: "center"};
            let textOne = this.game.add.text(this.teamOne.x, this.teamOne.y, "1", styleTeamOne);
            textOne.anchor.set(-0.3, -0.3);

            let teamTwoBmd = this.game.add.bitmapData(50,50);
            teamTwoBmd.ctx.rect(0,0,50,50);
            teamTwoBmd.ctx.fillStyle = '#0000ff';
            teamTwoBmd.ctx.fill();
            this.teamTwo = this.game.add.sprite(700,490, teamTwoBmd);
            this.teamTwo.alpha = 0.5;
            this.teamTwo.inputEnabled = true;
            this.teamTwo.selected = false;
            let styleTeamTwo = { font: "32px Arial", fill: "#ffffff", align: "center"};
            let textTwo = this.game.add.text(this.teamTwo.x, this.teamTwo.y, "2", styleTeamTwo);
            textTwo.anchor.set(-0.3, -0.3);

            var styleError = { font: "16px Arial", fill: "#ff0000", align: "center"};
            this.error = this.game.add.text(50, 120, '', styleError);

            this.game.input.keyboard.removeKeyCapture([8,13]);
            let del = this.game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE);
            del.onDown.add(this.deleteLastLetter, this);
            let enter = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            enter.onDown.add(this.submit, this);

            this.game.input.keyboard.addCallbacks(this, null, null, this.keyPress);

            this.game.ws.init = this.initArena.bind(this);
            this.game.ws.requestEnter = this.requestEnter.bind(this);
        }

        update(){
            if (this.meleeSprite.input.pointerOver())
            {
                this.meleeSprite.alpha = 1;
                if (this.game.input.activePointer.leftButton.isDown) {
                    this.meleeSprite.selected = true;
                    this.rangedSprite.selected = false;
                    this.fightType = 'melee';
                }
            } else {
                if (!this.meleeSprite.selected){this.meleeSprite.alpha = 0.5;}
            }

            if (this.rangedSprite.input.pointerOver())
            {
                this.rangedSprite.alpha = 1;
                if (this.game.input.activePointer.leftButton.isDown) {
                    this.meleeSprite.selected = false;
                    this.rangedSprite.selected = true;
                    this.fightType = 'ranged';
                }
            } else {
                if (!this.rangedSprite.selected){this.rangedSprite.alpha = 0.5;}
            }

            // team selection
            if (this.teamOne.input.pointerOver())
            {
                this.teamOne.alpha = 1;
                if (this.game.input.activePointer.leftButton.isDown) {
                    this.teamOne.selected = true;
                    this.teamTwo.selected = false;
                    this.team = 1;
                }
            } else {
                if (!this.teamOne.selected){this.teamOne.alpha = 0.5;}
            }

            if (this.teamTwo.input.pointerOver())
            {
                this.teamTwo.alpha = 1;
                if (this.game.input.activePointer.leftButton.isDown) {
                    this.teamTwo.selected = true;
                    this.teamOne.selected = false;
                    this.team = 2;
                }
            } else {
                if (!this.teamTwo.selected){this.teamTwo.alpha = 0.5;}
            }
        }

        private keyPress(char: any) {
            this.textInput.text = this.textInput.text + char;
        }

        private deleteLastLetter(){
            if (this.textInput.text.length > 0) {
                this.textInput.text = this.textInput.text.substring(0, this.textInput.text.length - 1);
            }
        }

        private submit() {
            if (this.textInput.text != '' && this.team != undefined && this.fightType != undefined) {
                this.game.ws.send(
                {
                    type: 'requestEnter',
                    fightType: this.fightType,
                    team: this.team,
                    playerId: this.textInput.text
                });
            } else {
                this.error.text = 'Write a playerName, select a team and a weapon!';
            }
        }

        private requestEnter(message: any) {
            this.error.text = message.error;
        }

        private initArena(message: any) {
            // remove the onPress callback
            this.game.input.keyboard.onPressCallback = null;
            // starts the new state
            this.game.state.start('Arena1', true, false, message);
        }
    }
}
