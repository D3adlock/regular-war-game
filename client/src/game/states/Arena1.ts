/// <reference path="../players/PlayerFactory.ts" />
/// <reference path="../players/PlayersGroup.ts" />

module Rwg {

    export class Arena1 extends Phaser.State {

        private background: any;
        private servermessages: number;

        init (initParam: any) {
            // creates the user player
            PlayerFactory.createUserPlayer(this.game, initParam);
        }

        create() {
            this.game.stage.disableVisibilityChange = true;

            // scenario setings
            this.game.world.setBounds(0, 0, 1920, 1920);
            this.background = this.game.add.tileSprite(0, 0, 1920, 1920, 'background');
            this.background.sendToBack();

            // initializes the forPlayers group for this state
            this.game.foePlayers = new PlayersGroup(this.game);
            this.game.allyPlayers = new PlayersGroup(this.game);

            // hoock websocket methods
            this.game.ws.updatePlayerPosition = this.updatePlayerPosition.bind(this);
            this.game.ws.updatePlayerVelocity = this.updatePlayerVelocity.bind(this);
            this.game.ws.attack = this.attack.bind(this);
            this.game.ws.playerKilled = this.playerKilled.bind(this);
            this.game.ws.removePlayer = this.removePlayer.bind(this);
            this.game.ws.skillThrown = this.skillThrown.bind(this);

            // set the camara
            this.game.camera.follow(this.game.userPlayer);

            // for debugin
            this.gameTime = 0;
        }

        public updatePlayerPosition(message: any) {
            if (message.playerId == this.game.userPlayer.playerId) {
                return;
            }
            let player = this.getPlayer(message);
            if (player == null) {
                PlayerFactory.createPlayer(this.game, message);
                this.reorderWeaponSprites();
            } else {
                player.updatePlayerPosition(message.x, message.y);
            }
        }

        public updatePlayerVelocity(message: any) {
            if (message.playerId == this.game.userPlayer.playerId) {
                return;
            }
            let player = this.getPlayer(message);
            if (player == null) {
                PlayerFactory.createPlayer(this.game, message);
                this.reorderWeaponSprites();
            } else {
                player.updatePlayerVelocity(message.velocityX, message.velocityY, message.x, message.y);
            }
        }

        public playerKilled(message: any) {
            // if it is my own killed message I do nothing
            if (message.playerId == this.game.userPlayer.playerId) {
                return;
            }
            // if it was my kill
            if (message.killedBy == this.game.userPlayer.playerId) {
                this.game.userPlayer.addAKill();
            }
        }

        // if recieves attack message from server perform the attack
        public attack(message: any) {
            if (message.playerId == this.game.userPlayer.playerId) {
                return;
            }
            let player = this.getPlayer(message);
            if (player != null) { player.attacks[message.attackName].attack(message); }
        }

        public skillThrown(message: any) {
            if (message.playerId == this.game.userPlayer.playerId) {
                return;
            }

            let player = this.getPlayer(message);
            if (player != null) { player.skills[message.skillName].skillThrown(message);}
        }

        // if recieves player leave from server updates the player list
        public removePlayer(message: any) {
            let foe = this.game.foePlayers.getPlayerById(message.playerId);
            if (foe != null) {
                foe.destroyPlayer();
                this.game.foePlayers.remove(foe);
            }
        }

        /*
         * 
         * Debug methods
         *
         */

        update() {
            if (this.game.time.now  > this.gameTime) {
                this.game.debug.text('download : ' + this.game.ws.messagesByteDataReceived/1000 +' (Kb/s)' , 32, 128);
                this.game.debug.text('upload : ' + this.game.ws.messagesByteDataSend/1000 + " (Kb/s)", 32, 148);
                this.game.ws.messagesByteDataReceived = 0;
                this.game.ws.messagesByteDataSend = 0;
                this.gameTime = this.game.time.now + 1000;
            }
        }

        /*
         *
         *  UTILITY METHODS
         *
         */

        private getPlayer(data: any) {
            let player = null;
            if (data.team == this.game.userPlayer.team){
                player = this.game.allyPlayers.getPlayerById(data.playerId);
            } else {
                player = this.game.foePlayers.getPlayerById(data.playerId);
            }
            return player;
        }

        private reorderWeaponSprites() {
            this.background.sendToBack();
            
            this.game.foePlayers.forEach (
                function(member) { 
                    this.game.world.bringToTop(member.target);
                }
            , this, true);

            this.game.foePlayers.forEach (
                function(member) { 
                    this.game.world.bringToTop(member.key);
                }
            , this, true);

            this.game.world.bringToTop(this.game.userPlayer);

            this.game.foePlayers.forEach (
                function(member) { 
                    if(member.weaponSprite != null) {this.game.world.bringToTop(member.weaponSprite);}
                }
            , this, true);
            
            if(this.game.userPlayer.weaponSprite != null) {this.game.world.bringToTop(this.game.userPlayer.weaponSprite);}
            
            this.game.foePlayers.forEach (
                function(member) { 
                    this.game.world.bringToTop(member.playerNameLabel);
                }
            , this, true);

            this.game.world.bringToTop(this.game.userPlayer.uiMask);
        }
    }
}
