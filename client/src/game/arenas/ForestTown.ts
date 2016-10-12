/// <reference path="../core/super/BaseChar.ts" />
/// <reference path="../core/factories/CharFactory.ts" />
/// <reference path="../characters/CharacterSelecter.ts" />
/// <reference path="../ui/Ui.ts" />
/// <reference path="../core/enums/MessageType.ts" />
/// <reference path="../core/factories/StageCollisionFactory.ts" />

module Rwg {

    export class ForestTown extends Phaser.State {

        private playersGroup:any;
        private players:any;
        private ui:any;
        private map:any;

        public respawns:any;
        public player:BaseChar;

        init (initParam:any) {

            //disable the game block in background
            this.game.stage.disableVisibilityChange = true;

            // crates the players group
            this.playersGroup = this.game.add.group();
            this.players = {};

            // creates the player character
            let charArgs = CharacterSelecter.getCharacterArgs(initParam.character);
            charArgs.base.name = initParam.name;
            charArgs.base.attackControls = charArgs.attackControls;
            charArgs.base.skillControls = charArgs.skillControls;
            charArgs.base.controlable = true;
            charArgs.base.team = initParam.team;

            // creates the new character base on the arguments
            this.player = CharFactory.getChar(charArgs.base, this.game);
            this.player.character = initParam.character;
            this.playersGroup.add(this.player);

            // setUp the collisions for the user player
            this.ui = new Ui(this.game, initParam.playerScores);
        }

        create() {

            // camera follow
            this.game.camera.follow(this.player);

            this.game.ws.newPlayer = this.newPlayer.bind(this);
            this.game.ws.move = this.move.bind(this);
            this.game.ws.velocity = this.velocity.bind(this);
            this.game.ws.playerLeft = this.playerLeft.bind(this);
            this.game.ws.attack = this.attack.bind(this);
            this.game.ws.skill = this.skill.bind(this);
            this.game.ws.damage = this.damage.bind(this);
            this.game.ws.gameOver = this.gameOver.bind(this);

            // map setings
            this.map = this.game.add.tilemap('forestTownJSON');
            this.map.addTilesetImage('forestTown', 'forestTownImage');
            let background = this.map.createLayer('background');
            let foreground = this.map.createLayer('foreground');
            let top = this.map.createLayer('top');
            
            background.resizeWorld();
            foreground.sendToBack();
            background.sendToBack();
            this.game.physics.box2d.setBoundsToWorld();
            (new StageCollisionFactory()).getCollisionObjects(this.game, this.map.collision.Collision, false);
        
            // set the respown positions for each team
            let respawnGroup = this.game.add.group();
            this.map.createFromObjects('Respawns', 'team_zero', null, null, false, false, respawnGroup);
            this.map.createFromObjects('Respawns', 'team_one', null, null, false, false, respawnGroup);

            this.respawns = {};
            this.respawns.team_zero = respawnGroup.getChildAt(0).position;
            this.respawns.team_one = respawnGroup.getChildAt(1).position;

            if (this.player.team == '1') {
                this.player.moveCharacterToXY(this.respawns.team_one.x, this.respawns.team_one.y);
                this.player.respawn = this.respawns.team_one;
            }  else {
                this.player.moveCharacterToXY(this.respawns.team_zero.x, this.respawns.team_zero.y);
                this.player.respawn = this.respawns.team_zero;
            }
        }

        render () {
            this.game.world.bringToTop(this.ui.ui);
            this.playersGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        }

        // need to whipe all the stage objects
        shutdown() {
            this.game.ws.newPlayer = function(){};
            this.game.ws.move = function(){};
            this.game.ws.velocity = function(){};
            this.game.ws.playerLeft = function(){};
            this.game.ws.attack = function(){};
            this.game.ws.skill = function(){};
            this.game.ws.damage = function(){};
            this.game.ws.gameOver = function(){};

            this.player = null;
            this.ui = null;
        }

        private newPlayer(message) {
            // creates the player character
            let charArgs = CharacterSelecter.getCharacterArgs(message.character);
            charArgs.base.name = message.name;
            charArgs.base.team = message.team;
            charArgs.base.targetable = true;

            // creates the new character base on the arguments
            let newPlayer = CharFactory.getChar(charArgs.base, this.game);
            newPlayer.character = message.character;
            this.playersGroup.add(newPlayer);
            this.players[message.name] = newPlayer;


            // init position
            let initPos = {x:0,y:0};

            // sets the respawn
            if (newPlayer.team) {
                initPos.x = this.respawns.team_one.x;
                initPos.y = this.respawns.team_one.y;
                newPlayer.respawn = this.respawns.team_one;
            }  else {
                initPos.x = this.respawns.team_zero.x;
                initPos.y = this.respawns.team_zero.y;
                newPlayer.respawn = this.respawns.team_zero;
            }

            // set the init pos if the player already existed
            if (message.x != 0 || message.y != 0) {
                initPos = {x: message.x, y: message.y};
            }

            newPlayer.moveCharacterToXY(initPos.x, initPos.y);

            // updates the UI

            if (!this.ui.leaderBoard.exists(message.name)) {this.ui.leaderBoard.addPlayer(newPlayer);}
            
            this.ui.leaderBoard.updateBoardInfoKill(message.name, message.kill);
            this.ui.leaderBoard.updateBoardInfoAssist(message.name, message.assist);
            this.ui.leaderBoard.updateBoardInfoDeath(message.name, message.death);
        }

        // this process is thought if the browser windows is off of focuss and there are a new loggin 
        // that was not caught by the client
        private requestPlayerInfo(name:string) {
            this.game.ws.send({
                type: MessageType.REQUEST_PLAYER_INFO,
                name: name
            })
        }

        private move(message:any) {
            if (this.player.name == message.name) {
                return;
            }

            if (this.players[message.name]) {
                this.players[message.name].moveCharacterToXY(message.x, message.y);
            } else {
                this.requestPlayerInfo(message.name);
            }
        }

        private velocity(message:any) {
            if (this.player.name == message.name) {
                return;
            }

            if (this.players[message.name]) {
                this.players[message.name].setVelocity(message.x, message.y, message.velocityBitMask);
            }
        }

        private playerLeft(message:any) {
            if (this.players[message.name]) {
                this.players[message.name].destroy();
            }
        }

        private attack(message:any) {
            if (this.player.name == message.name) {
                return;
            }
            if (this.players[message.name]) {
                this.players[message.name].attacks[message.attackName].attack(message);
            }
        }

        private skill(message:any) {
            if (this.player.name == message.name) {
                return;
            }

            if (this.players[message.name]) {
                this.players[message.name].skills[message.skillName].skillThrown(message);
            }
        }

        private damage(message:any) {
            // update leader board
            if (message.killed) {
                this.ui.leaderBoard.updateBoardInfoKill(message.hittedBy, message.kill);

                if (!message.assist) {message.assist = []};
                for (let i = 0; i < message.assist.length; i++) {
                    this.ui.leaderBoard.updateBoardInfoAssist(message.assist[i].name, message.assist[i].assist);
                };

                this.ui.leaderBoard.updateBoardInfoDeath(message.name, message.death);
            }

            // can be any animation or somethig
            if (this.player.name == message.hittedBy && message.killed) {
                console.log('killed!!');
            }

            if (this.players[message.name]) {
                this.players[message.name].damage(message);
            }
        }

        private gameOver(message) {

            // updates the leader board
            if (!message.assist) {message.assist = []};
            this.ui.leaderBoard.updateBoardInfoKill(message.winner, message.kill);
            for (let i = 0; i < message.assist.length; i++) {
                this.ui.leaderBoard.updateBoardInfoAssist(message.assist[i].name, message.assist[i].assist);
            };
            this.ui.leaderBoard.updateBoardInfoDeath(message.name, message.death);

            let player = this.player;
            let leaderBoard = this.ui.leaderBoard.players;

            this.game.state.clearCurrentState();

            this.game.state.start('GameOver', true, false, {
                arena: 'ForestTown',
                player: player,
                leaderBoard: leaderBoard,
                winner: message.winner
            });
        }
    }
}
