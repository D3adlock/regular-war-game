/// <reference path="../core/enums/MessageType.ts" />

module Rwg {

    export class EnterName extends Phaser.State {

        private textInput: Phaser.bitmapText;

        create() {

            let background = this.game.add.sprite(0,0,'background');

            var style = { font: "16px Arial", fill: "#ffffff", align: "center"};
            this.textInput = this.game.add.text(50, 100, '', style);

            this.game.input.keyboard.removeKeyCapture([8,13]);
            
            let del = this.game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE);
            del.onDown.add(this.deleteLastLetter, this);
            
            let enter = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            enter.onDown.add(this.submit, this);

            this.game.input.keyboard.addCallbacks(this, null, null, this.keyPress);

            this.game.ws.continueToCharSelection = this.continueToCharSelection.bind(this);
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

            if (!/^[0-9a-zA-Z]+$/.test(this.textInput.text)){
                console.log("ivalid characters");
                return;
            }

            if (this.textInput.text != '') {
                this.game.ws.send({
                    type: MessageType.NAME_SELECTION, 
                    name: this.textInput.text
                });
            } else {
                console.log("name is empty");
            }
        }

        private continueToCharSelection(message: any) {
            if (message.nameAccepted) {
                this.game.input.keyboard.onPressCallback = null;
                this.game.state.start('CharSelection', true, false, {
                    name: this.textInput.text
                });
            } else {
                console.log(message.error);
                //this.error.text = message.error;
            }
            
        }
    }
}
