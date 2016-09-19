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
            game.userPlayer.isUserPlayer = true;

            // controlls
            (new PlayerMovementControls(300)).provide(game.userPlayer);

            if (data.fightType == 'melee') {
                PlayerFactory.allAttacks(game, game.userPlayer);
                game.userPlayer.currentLeftClickAction = game.userPlayer.attacks['sword'].triggerAttack.bind(game.userPlayer);
                game.userPlayer.defaultLeftClickAction = game.userPlayer.attacks['sword'].triggerAttack.bind(game.userPlayer);
                game.userPlayer.lastActiveAttack = 'sword';
            } else if (data.fightType == 'ranged'){
                PlayerFactory.allAttacks(game, game.userPlayer);
                game.userPlayer.currentLeftClickAction = game.userPlayer.attacks['bow'].triggerAttack.bind(game.userPlayer);
                game.userPlayer.defaultLeftClickAction = game.userPlayer.attacks['bow'].triggerAttack.bind(game.userPlayer);
                game.userPlayer.lastActiveAttack = 'bow';
            }
        }

        public static createPlayer(game: Phaser.Game, data: any) {          

            let newPlayer = new Player(game, data.x, data.y);
            newPlayer.isUserPlayer = false;
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
            melee.range = 25;
            melee.attackSpeed = 300;
            melee.coolDown = 800;
            melee.hitAreaWidth = 10;
            melee.hitAreaHeight = 70;
            melee.activeAttackKey = Phaser.KeyCode.Q;
            melee.debug = false;
            melee.framesForTheAnimation = 5;
            melee.singleAnimation = false;
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
            ranged.framesForTheAnimation = 3;
            ranged.singleAnimation = false;
            ranged.provide(game, player);

            //skills
            let targetSkill = new TargetSkill();
            targetSkill.skillName = 'test';
            targetSkill.damage = 0;
            targetSkill.range = 500;
            targetSkill.castingSpeed = 2000;
            targetSkill.coolDown = 800;
            targetSkill.castKey = Phaser.KeyCode.X;
            targetSkill.maxTargetsSelected = 2;
            targetSkill.framesForTheAnimation = 3;
            targetSkill.singleAnimation = true;
            targetSkill.targetOnAlly = false;
            targetSkill.effect = function(targets) {console.log(targets);};

            targetSkill.provide(game, player);
        }
    }
}
