/// <reference path="Player.ts" />

module Rwg {

    export class EnableKeyboardInput {

        public provide(player: Player) {
            player.enableKeyboardInput = this.enableKeyboardInput.bind(player);
            player.enableKeyboardInput();
        }

        private enableKeyboardInput() {
            this.game.input.keyboard.addCallbacks(this, this.keyDownCallBack, this.keyUpCallBack, null);
        }
    }
}