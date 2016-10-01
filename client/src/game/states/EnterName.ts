/// <reference path="../core/enums/MessageType.ts" />

module Rwg {

    export class EnterName extends Phaser.State {

        private textInput: Phaser.bitmapText;

        create() {
            var style = { font: "16px Arial", fill: "#ffffff", align: "center"};
            this.textInput = this.game.add.text(50, 100, '', style);

            this.game.input.keyboard.removeKeyCapture([8,13]);
            
            let del = this.game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE);
            del.onDown.add(this.deleteLastLetter, this);
            
            let enter = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            enter.onDown.add(this.submit, this);

            this.game.input.keyboard.addCallbacks(this, null, null, this.keyPress);

            this.game.ws.init = this.initStage.bind(this);
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
            if (this.textInput.text != '') {
                this.game.ws.send(
                {
                    type: MessageType.REQUEST_ENTER,
                    x: 80,
                    y: 80,
                    name: this.textInput.text
                });
            }
        }

        private request(message: any) {
            this.error.text = message.error;
        }

        private initStage(message: any) {
            // remove the onPress callback
            this.game.input.keyboard.onPressCallback = null;
            // starts the new state
            this.game.state.start('TestStage', true, false, message);
        }
    }
}
