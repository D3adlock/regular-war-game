/// <reference path="Player.ts" />

module Rwg {

    export class PlayerAttackControls {

        public provide(player: Player) {
            player.initAttackControls = this.initAttackControls.bind(player);
            player.attackControlsEnabled = true;
            player.attackTime = 0;
            // this value will be overwrite once the weapon had been provided
            player.weapon.coolDown = 500;

            player.initAttackControls();
        }

        private initAttackControls() {
            this.updateMethods['leftClickAttack'] = function() {
                if (this.game.input.activePointer.leftButton.isDown && this.attackControlsEnabled &&
                    this.game.time.now > this.attackTime) {
                    // this method is in the weapon provider object
                    this.triggerAttack();
                    this.attackTime = this.game.time.now + this.weapon.coolDown;
                }
            }.bind(this);  
        }
    }
}
