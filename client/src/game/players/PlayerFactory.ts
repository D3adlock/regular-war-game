/// <reference path="UserPlayer.ts" />
/// <reference path="../controls/PlayerMovementControls.ts" />
/// <reference path="../skills/TargetSkill.ts" />
/// <reference path="../attacks/MeleeAttack.ts" />
/// <reference path="../attacks/RangedAttack.ts" />

module Rwg {

    export class PlayerFactory {

        public static createUserPlayer(game: Phaser.Game, data: any) {

            game.userPlayer = new UserPlayer(game, data.x, data.y);
            game.userPlayer.team = data.team;
            game.userPlayer.setColor(data.color);
            game.userPlayer.setPlayerId(data.playerId);
            game.userPlayer.fightType = data.fightType;

            // controlls
            (new PlayerMovementControls(300)).provide(game.userPlayer);

            // skills
            // let targetSkill = new TargetSkill('test', 0, 100, 100, 2000, Phaser.KeyCode.E, 2, function(targets){console.log(targets)});
            // targetSkill.provide(game, game.userPlayer);

            if (data.fightType == 'melee') {
                PlayerFactory.allAttacks(game, game.userPlayer);
                game.userPlayer.currentLeftClickAction = game.userPlayer.attacks['sword'].triggerAttack.bind(game.userPlayer);
            } else if (data.fightType == 'ranged'){
                PlayerFactory.allAttacks(game, game.userPlayer);
                game.userPlayer.currentLeftClickAction = game.userPlayer.attacks['bow'].triggerAttack.bind(game.userPlayer);
            }
        }

        public static createPlayer(game: Phaser.Game, data: any) {          

            let newPlayer = new Player(game, data.x, data.y);
            newPlayer.team = data.team;
            newPlayer.setColor(data.color);
            newPlayer.setPlayerId(data.playerId);
            newPlayer.fightType = data.fightType;

            if(newPlayer.team == game.userPlayer.team) {
                game.allyPlayers.add(newPlayer);
            } else {
                game.foePlayers.add(newPlayer);
            }

            PlayerFactory.allAttacks(game,newPlayer);

            // every time there is a new player it has to add the targeteable element
            game.userPlayer.addTargetable(newPlayer);
        }

        public static allAttacks(game, player) {
            let melee = new MeleeAttack();
            melee.attackName = 'sword';
            melee.damage = 20;
            melee.range = 50;
            melee.attackSpeed = 300;
            melee.coolDown = 800;
            melee.hitAreaWidth = 30;
            melee.hitAreaHeight = 100;
            melee.activeAttackKey = Phaser.KeyCode.Q;
            melee.debug = true;
            melee.upFrames = [0,4,8,12];
            melee.downFrames = [0,4,8,12];
            melee.leftFrames = [0,4,8,12];
            melee.rightFrames = [0,4,8,12];
            melee.provide(game, player);

            let ranged = new RangedAttack();
            ranged.attackName = 'bow';
            ranged.bulletSpriteName = 'arrow';
            ranged.damage = 8;
            ranged.range = 500;
            ranged.attackSpeed = 250; 
            ranged.coolDown = 400;
            ranged.hitAreaWidth = 12;
            ranged.hitAreaHeight = 35;
            ranged.cadence = 2;
            ranged.bulletSpeed = 750;
            ranged.activeAttackKey = Phaser.KeyCode.E;
            ranged.upFrames = [0,4,8,12];
            ranged.downFrames = [0,4,8,12];
            ranged.leftFrames = [0,4,8,12];
            ranged.rightFrames = [0,4,8,12];
            ranged.provide(game, player);
        }
    }
}
