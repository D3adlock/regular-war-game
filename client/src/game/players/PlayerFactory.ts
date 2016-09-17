/// <reference path="UserPlayer.ts" />
/// <reference path="../weapons/RangedWeapon.ts" />
/// <reference path="../weapons/MeleeWeapon.ts" />
/// <reference path="../weapons/WeaponAnimations.ts" />
/// <reference path="../controls/EnableKeyboardInput.ts" />
/// <reference path="../controls/PlayerMovementControls.ts" />
/// <reference path="../controls/PlayerAttackControls.ts" />

module Rwg {

    export class PlayerFactory {

        public static createUserPlayer(game: Phaser.Game, data: any) {

            game.userPlayer = new UserPlayer(game, data.x, data.y);
            game.userPlayer.team = data.team;
            game.userPlayer.setColor(data.color);
            game.userPlayer.setPlayerId(data.playerId);
            game.userPlayer.fightType = data.fightType;

            (new EnableKeyboardInput).provide(game.userPlayer);
            (new PlayerMovementControls(300)).provide(game.userPlayer);
            (new PlayerAttackControls()).provide(game.userPlayer);

            if (data.fightType == 'melee') {
                let melee = new MeleeWeapon('sword', 20, 50, 500, 800, 30, 100, true);
                melee.provide(game, game.userPlayer);
                let animations = new WeaponAnimations([0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],true);
                animations.provide(game, game.userPlayer);
                this.movementSpeed = 350;
            } else {
                let ranged = new RangedWeapon('machineGun', 8, 500, 200, 300, 3, 750, 30, 5, true);
                ranged.provide(game, game.userPlayer);
                let animations = new WeaponAnimations([0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],true);
                animations.provide(game, game.userPlayer);
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

            if (newPlayer.fightType == 'melee') {
                let melee = new MeleeWeapon('sword', 20, 50, 500, 800, 30, 100, true);
                melee.provide(game, newPlayer);
                let animations = new WeaponAnimations([0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],true);
                animations.provide(game, newPlayer);
            } else {
                let ranged = new RangedWeapon('machineGun', 8, 500, 200, 200, 3, 750, 30, 5, true);
                ranged.provide(game, newPlayer);
                let animations = new WeaponAnimations([0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],true);
                animations.provide(game, newPlayer);
            }
        }
    }
}
