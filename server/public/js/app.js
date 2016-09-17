var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Rwg;
(function (Rwg) {
    var StartScreen = (function (_super) {
        __extends(StartScreen, _super);
        function StartScreen() {
            _super.apply(this, arguments);
        }
        StartScreen.prototype.preload = function () {
            this.game.load.spritesheet('sword', '../assets/sword.png', 49, 27, 5);
            this.game.load.spritesheet('swordFighter', '../assets/swordFighter.png', 32, 48, 16);
            this.game.load.spritesheet('meleeType', '../assets/melee.png', 200, 200);
            this.game.load.spritesheet('rangedType', '../assets/ranged.png', 200, 200);
            this.game.load.image('background', '../assets/debug-grid-1920x1920.png');
        };
        StartScreen.prototype.create = function () {
            var style = { font: "16px Arial", fill: "#ffffff", align: "center" };
            this.instructions = this.game.add.text(50, 50, 'write your player name, submit with ENTER : ', style);
            this.textInput = this.game.add.text(50, 100, '', style);
            // class selection sprites
            this.meleeSprite = this.game.add.sprite(550, 20, 'meleeType');
            this.meleeSprite.alpha = 0.5;
            this.meleeSprite.inputEnabled = true;
            this.meleeSprite.selected = false;
            this.rangedSprite = this.game.add.sprite(550, 260, 'rangedType');
            this.rangedSprite.alpha = 0.5;
            this.rangedSprite.inputEnabled = true;
            this.rangedSprite.selected = false;
            // team selection sprites
            var teamOneBmd = this.game.add.bitmapData(50, 50);
            teamOneBmd.ctx.rect(0, 0, 50, 50);
            teamOneBmd.ctx.fillStyle = '#ff0000';
            teamOneBmd.ctx.fill();
            this.teamOne = this.game.add.sprite(550, 490, teamOneBmd);
            this.teamOne.alpha = 0.5;
            this.teamOne.inputEnabled = true;
            this.teamOne.selected = false;
            var styleTeamOne = { font: "32px Arial", fill: "#ffffff", align: "center" };
            var textOne = this.game.add.text(this.teamOne.x, this.teamOne.y, "1", styleTeamOne);
            textOne.anchor.set(-0.3, -0.3);
            var teamTwoBmd = this.game.add.bitmapData(50, 50);
            teamTwoBmd.ctx.rect(0, 0, 50, 50);
            teamTwoBmd.ctx.fillStyle = '#0000ff';
            teamTwoBmd.ctx.fill();
            this.teamTwo = this.game.add.sprite(700, 490, teamTwoBmd);
            this.teamTwo.alpha = 0.5;
            this.teamTwo.inputEnabled = true;
            this.teamTwo.selected = false;
            var styleTeamTwo = { font: "32px Arial", fill: "#ffffff", align: "center" };
            var textTwo = this.game.add.text(this.teamTwo.x, this.teamTwo.y, "2", styleTeamTwo);
            textTwo.anchor.set(-0.3, -0.3);
            var styleError = { font: "16px Arial", fill: "#ff0000", align: "center" };
            this.error = this.game.add.text(50, 120, '', styleError);
            this.game.input.keyboard.removeKeyCapture([8, 13]);
            var del = this.game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE);
            del.onDown.add(this.deleteLastLetter, this);
            var enter = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            enter.onDown.add(this.submit, this);
            this.game.input.keyboard.addCallbacks(this, null, null, this.keyPress);
            this.game.ws.init = this.initArena.bind(this);
            this.game.ws.requestEnter = this.requestEnter.bind(this);
        };
        StartScreen.prototype.update = function () {
            if (this.meleeSprite.input.pointerOver()) {
                this.meleeSprite.alpha = 1;
                if (this.game.input.activePointer.leftButton.isDown) {
                    this.meleeSprite.selected = true;
                    this.rangedSprite.selected = false;
                    this.fightType = 'melee';
                }
            }
            else {
                if (!this.meleeSprite.selected) {
                    this.meleeSprite.alpha = 0.5;
                }
            }
            if (this.rangedSprite.input.pointerOver()) {
                this.rangedSprite.alpha = 1;
                if (this.game.input.activePointer.leftButton.isDown) {
                    this.meleeSprite.selected = false;
                    this.rangedSprite.selected = true;
                    this.fightType = 'ranged';
                }
            }
            else {
                if (!this.rangedSprite.selected) {
                    this.rangedSprite.alpha = 0.5;
                }
            }
            // team selection
            if (this.teamOne.input.pointerOver()) {
                this.teamOne.alpha = 1;
                if (this.game.input.activePointer.leftButton.isDown) {
                    this.teamOne.selected = true;
                    this.teamTwo.selected = false;
                    this.team = 1;
                }
            }
            else {
                if (!this.teamOne.selected) {
                    this.teamOne.alpha = 0.5;
                }
            }
            if (this.teamTwo.input.pointerOver()) {
                this.teamTwo.alpha = 1;
                if (this.game.input.activePointer.leftButton.isDown) {
                    this.teamTwo.selected = true;
                    this.teamOne.selected = false;
                    this.team = 2;
                }
            }
            else {
                if (!this.teamTwo.selected) {
                    this.teamTwo.alpha = 0.5;
                }
            }
        };
        StartScreen.prototype.keyPress = function (char) {
            this.textInput.text = this.textInput.text + char;
        };
        StartScreen.prototype.deleteLastLetter = function () {
            if (this.textInput.text.length > 0) {
                this.textInput.text = this.textInput.text.substring(0, this.textInput.text.length - 1);
            }
        };
        StartScreen.prototype.submit = function () {
            if (this.textInput.text != '' && this.team != undefined && this.fightType != undefined) {
                this.game.ws.send({
                    type: 'requestEnter',
                    fightType: this.fightType,
                    team: this.team,
                    playerId: this.textInput.text
                });
            }
            else {
                this.error.text = 'Write a playerName, select a team and a weapon!';
            }
        };
        StartScreen.prototype.requestEnter = function (message) {
            this.error.text = message.error;
        };
        StartScreen.prototype.initArena = function (message) {
            // remove the onPress callback
            this.game.input.keyboard.onPressCallback = null;
            // starts the new state
            this.game.state.start('Arena1', true, false, message);
        };
        return StartScreen;
    }(Phaser.State));
    Rwg.StartScreen = StartScreen;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(game, x, y) {
            _super.call(this, game, x, y, 'swordFighter');
            // initializing the object
            this.anchor.setTo(0.5, 0.5);
            this.scale.setTo(1.5, 1.5);
            this.game.add.existing(this);
            this.weapon = this.game.add.physicsGroup();
            this.createWalkAnimations();
            this.FacePositions = { LEFT: 1, RIGHT: 2, UP: 3, DOWN: 4 };
            // playerlabelname
            var style = { font: "16px Arial", fill: "#ffffff", wordWrap: true, align: "center" };
            this.playerNameLabel = this.game.add.text(x, y, '', style);
            this.playerNameLabel.anchor.set(0.5, 2.3);
            this.playerNameLabel.position = this.position;
            //methods ment to be run in the update() code block
            this.updateMethods = {};
            this.updateMethods['hitTheUserPlayer'] = function () {
                this.game.physics.arcade.overlap(this.weapon, this.game.userPlayer, this.hitUserPlayer, this.userPlayerIsInMyTeam, this);
            }.bind(this);
            this.updateMethods['hitAFoePlayer'] = function () {
                this.game.physics.arcade.overlap(this.weapon, this.game.foePlayers, this.hitAFoe, this.hitMyselfCheck, this);
            }.bind(this);
            // hash of methods that are meant to run when keyboard is up or down
            this.keyDownInputMethods = {};
            this.keyUpInputMethods = {};
            this.keyStack = [];
        }
        /*
         *
         * DINAMIC CALLBACKS METHODS
         *
         */
        Player.prototype.update = function () {
            for (var key in this.updateMethods) {
                this.updateMethods[key]();
            }
        };
        Player.prototype.keyDownCallBack = function (event) {
            for (var key in this.keyDownInputMethods) {
                this.keyDownInputMethods[key](event);
            }
        };
        Player.prototype.keyUpCallBack = function (event) {
            for (var key in this.keyUpInputMethods) {
                this.keyUpInputMethods[key](event);
            }
        };
        /*
         *
         * GENERIC PLAYER METHODS
         *
         */
        Player.prototype.updatePlayerPosition = function (x, y) {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.x = x;
            this.y = y;
            this.animations.stop('rightWalkAnimation', this.frame);
            this.animations.stop('leftWalkAnimation', this.frame);
            this.animations.stop('downWalkAnimation', this.frame);
            this.animations.stop('upWalkAnimation', this.frame);
        };
        Player.prototype.updatePlayerVelocity = function (velocityX, velocityY, x, y) {
            this.x = x;
            this.y = y;
            this.body.velocity.x = velocityX;
            this.body.velocity.y = velocityY;
            this.startWalkAnimationBaseOnVelocity();
        };
        Player.prototype.destroyPlayer = function () {
            this.playerNameLabel.destroy();
            this.destroy();
        };
        Player.prototype.setColor = function (color) {
            this.color = color;
            this.tint = color;
        };
        Player.prototype.setPlayerId = function (playerId) {
            this.playerId = playerId;
            this.playerNameLabel.text = 'Team-' + this.team + ': ' + playerId;
        };
        Player.prototype.hitMyselfCheck = function (weaponFromColision, foePlayer) {
            return this.playerId != foePlayer.playerId;
        };
        Player.prototype.userPlayerIsInMyTeam = function (userPlayer, weaponFromColision) {
            return this.team != userPlayer.team;
        };
        /*
         *
         *  SPRITE ANIMATION METHODS
         *
         */
        Player.prototype.createWalkAnimations = function () {
            var rightWalkAnimation = this.animations.add('rightWalkAnimation', [8, 9, 10, 11], 15, true);
            var leftWalkAnimation = this.animations.add('leftWalkAnimation', [4, 5, 6, 7], 15, true);
            var downWalkAnimation = this.animations.add('downWalkAnimation', [0, 1, 2, 3], 15, true);
            var upWalkAnimation = this.animations.add('upWalkAnimation', [12, 13, 14, 15], 15, true);
        };
        Player.prototype.startWalkAnimationBaseOnVelocity = function () {
            switch (this.getFacingBaseOnVelocity()) {
                case this.FacePositions.RIGHT:
                    this.play('rightWalkAnimation');
                    break;
                case this.FacePositions.LEFT:
                    this.play('leftWalkAnimation');
                    break;
                case this.FacePositions.UP:
                    this.play('upWalkAnimation');
                    break;
                case this.FacePositions.DOWN:
                    this.play('downWalkAnimation');
            }
        };
        Player.prototype.getFacingBaseOnVelocity = function () {
            if (this.body.velocity.x > 0) {
                return this.FacePositions.RIGHT;
            }
            else if (this.body.velocity.x < 0) {
                return this.FacePositions.LEFT;
            }
            else if (this.body.velocity.y > 0) {
                return this.FacePositions.DOWN;
            }
            else if (this.body.velocity.y < 0) {
                return this.FacePositions.UP;
            }
        };
        Player.prototype.changeSightPositionToPoint = function (x, y) {
            switch (this.getSightPositionToPoint(x, y)) {
                case this.FacePositions.RIGHT:
                    this.frame = 8;
                    break;
                case this.FacePositions.LEFT:
                    this.frame = 4;
                    break;
                case this.FacePositions.UP:
                    this.frame = 12;
                    break;
                case this.FacePositions.DOWN:
                    this.frame = 0;
            }
        };
        Player.prototype.getSightPositionToPoint = function (x, y) {
            var horizontalDiff = x - this.x;
            var verticalDiff = y - this.y;
            if (horizontalDiff > 0 && Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
                return this.FacePositions.RIGHT;
            }
            else if (horizontalDiff < 0 && Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
                return this.FacePositions.LEFT;
            }
            else if (verticalDiff > 0 && Math.abs(horizontalDiff) < Math.abs(verticalDiff)) {
                return this.FacePositions.DOWN;
            }
            else if (verticalDiff < 0 && Math.abs(horizontalDiff) < Math.abs(verticalDiff)) {
                return this.FacePositions.UP;
            }
            else if (horizontalDiff > 0 && Math.abs(horizontalDiff) == Math.abs(verticalDiff)) {
                return this.FacePositions.RIGHT;
            }
            else if (horizontalDiff < 0 && Math.abs(horizontalDiff) == Math.abs(verticalDiff)) {
                return this.FacePositions.LEFT;
            }
        };
        /*
         * NULL METHODS FOR FILLING
         */
        Player.prototype.stopMovement = function (x, y) {
            this.x = x;
            this.y = y;
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.MovemenrtControlEnable = false;
        };
        Player.prototype.continueMovement = function () {
            this.MovemenrtControlEnable = true;
            if (this.keyStack.length != 0) {
                this.setVelocityForKey(this.keyStack[this.keyStack.length - 1]);
            }
        };
        return Player;
    }(Phaser.Sprite));
    Rwg.Player = Player;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
var Rwg;
(function (Rwg) {
    var UserPlayer = (function (_super) {
        __extends(UserPlayer, _super);
        function UserPlayer(game, x, y) {
            _super.call(this, game, x, y);
            this.hits = 0;
            this.hitPoints = 50;
            this.score = 0;
            this.controlEnable = true;
            // super important for hit detection
            this.game.physics.arcade.enable(this);
            this.body.collideWorldBounds = true;
            // add update methods for controll th  player character
            delete this.updateMethods['hitTheUserPlayer'];
            // UI display
            this.uiMask = this.game.add.graphics(0, 0);
            this.uiMask.beginFill(0x000000);
            this.uiMask.drawRect(0, 0, 800, 60);
            this.uiMask.fixedToCamera = true;
            var style = { font: "16px Arial", fill: "#ffffff", align: "center" };
            this.hipointsDisplay = this.game.add.text(50, 10, 'HP : ' + this.hitPoints, style);
            this.scoreDisplay = this.game.add.text(450, 10, 'Score : ' + this.score, style);
            this.uiMask.addChild(this.hipointsDisplay);
            this.uiMask.addChild(this.scoreDisplay);
        }
        UserPlayer.prototype.takeHit = function (damage, playerId) {
            this.hitPoints -= damage;
            if (this.hitPoints <= 0) {
                this.sendPlayerKill(playerId);
            }
            this.hipointsDisplay.text = 'HP : ' + this.hitPoints;
        };
        UserPlayer.prototype.sendPlayerKill = function (playerId) {
            this.game.ws.send({
                killedPlayer: this.playerId,
                killedBy: playerId,
                type: 'playerKilled'
            });
            this.updatesPosition(80, 80);
            // restore the player hitpoints
            this.hitPoints = 50;
        };
        UserPlayer.prototype.addAKill = function () {
            this.score++;
            this.scoreDisplay.text = 'Score : ' + this.score;
        };
        return UserPlayer;
    }(Rwg.Player));
    Rwg.UserPlayer = UserPlayer;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
var Rwg;
(function (Rwg) {
    var RangedWeapon = (function () {
        function RangedWeapon(weaponName, damage, range, attackSpeed, coolDown, cadence, bulletSpeed, hitAreaWidth, hitAreaHeight, debug) {
            this.weaponName = weaponName;
            this.damage = damage;
            this.range = range;
            this.attackSpeed = attackSpeed;
            this.coolDown = coolDown;
            this.cadence = cadence;
            this.bulletSpeed = bulletSpeed;
            this.hitAreaWidth = hitAreaWidth;
            this.hitAreaHeight = hitAreaHeight;
            this.debug = debug;
        }
        RangedWeapon.prototype.provide = function (game, player) {
            player.weapon.coolDown = this.coolDown;
            player.weapon.damage = this.damage;
            player.weapon.range = this.range;
            player.weapon.attackSpeed = this.attackSpeed;
            player.weapon.cadence = this.cadence;
            player.weapon.bulletSpeed = this.bulletSpeed;
            player.initWeapon = this.initWeapon.bind(player);
            player.hitUserPlayer = this.hitUserPlayer.bind(player);
            player.hitAFoe = this.hitAFoe.bind(player);
            player.triggerAttack = this.triggerAttack.bind(player);
            player.attack = this.attack.bind(player);
            player.initWeapon(this.hitAreaWidth, this.hitAreaHeight, this.debug);
        };
        RangedWeapon.prototype.initWeapon = function (hitAreaWidth, hitAreaHeight, debug) {
            for (var i = 0; i < this.weapon.cadence; i++) {
                // 5, 30
                var hitAreaBmd = this.game.add.bitmapData(hitAreaWidth, hitAreaHeight);
                hitAreaBmd.ctx.beginPath();
                hitAreaBmd.ctx.rect(0, 0, hitAreaWidth, hitAreaHeight);
                if (debug) {
                    hitAreaBmd.ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
                    hitAreaBmd.ctx.fill();
                }
                var hitAreaSprite = this.weapon.create(0, 0, hitAreaBmd);
                hitAreaSprite.exists = false;
                hitAreaSprite.visible = false;
                hitAreaSprite.checkWorldBounds = true;
                hitAreaSprite.events.onOutOfBounds.add(function (hitArea) { hitArea.kill(); }, this);
                hitAreaSprite.origin = {};
            }
            // this update method will check the distance of a bullet
            this.updateMethods['checkRangeFor' + this.weapon.weaponName] = function () {
                this.weapon.forEach(function (member, range) {
                    if (member.alive) {
                        if (Phaser.Point.distance(member.position, member.origin, true) > range) {
                            member.kill();
                        }
                    }
                }, this, true, this.weapon.range);
            }.bind(this);
        };
        RangedWeapon.prototype.hitUserPlayer = function (userPlayer, hitArea) {
            userPlayer.takeHit(this.weapon.damage, this.playerId);
            hitArea.kill();
        };
        RangedWeapon.prototype.hitAFoe = function (hitArea) {
            hitArea.kill();
        };
        RangedWeapon.prototype.triggerAttack = function () {
            var message = {
                playerId: this.playerId,
                targetX: this.game.input.worldX,
                targetY: this.game.input.worldY,
                x: this.x,
                y: this.y,
                type: 'attack',
                team: this.team
            };
            this.game.ws.send(message);
        };
        RangedWeapon.prototype.attack = function (message) {
            var hitAreaSprite = this.weapon.getFirstExists(false);
            if (hitAreaSprite) {
                var point = new Phaser.Point(message.targetX, message.targetY);
                this.changeSightPositionToPoint(message.targetX, message.targetY);
                // set the bullet position
                hitAreaSprite.rotation = this.game.physics.arcade.angleBetween(this.position, point);
                hitAreaSprite.reset(message.x, message.y);
                hitAreaSprite.anchor.set(0.5);
                // set the proyectle origin in the current position
                hitAreaSprite.origin.x = message.x;
                hitAreaSprite.origin.y = message.y;
                // play the attack animation if any
                if (this.playWeaponAnimationTowards) {
                    this.playWeaponAnimationTowards(message.targetX, message.targetY);
                    // start animation cancels the movement
                    this.stopMovement(message.x, message.y);
                }
                this.game.physics.arcade.moveToXY(hitAreaSprite, point.x, point.y, this.weapon.bulletSpeed);
            }
        };
        return RangedWeapon;
    }());
    Rwg.RangedWeapon = RangedWeapon;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
var Rwg;
(function (Rwg) {
    var MeleeWeapon = (function () {
        function MeleeWeapon(weaponName, damage, range, attackSpeed, coolDown, hitAreaWidth, hitAreaHeight, debug) {
            this.weaponName = weaponName;
            this.damage = damage;
            this.range = range;
            this.attackSpeed = attackSpeed;
            this.coolDown = coolDown;
            this.hitAreaWidth = hitAreaWidth;
            this.hitAreaHeight = hitAreaHeight;
            this.debug = debug;
        }
        MeleeWeapon.prototype.provide = function (game, player) {
            player.attackTime = 0;
            player.weapon.weaponName = this.weaponName;
            player.weapon.coolDown = this.coolDown;
            player.weapon.damage = this.damage;
            player.weapon.attackSpeed = this.attackSpeed;
            player.weapon.range = this.range;
            player.initWeapon = this.initWeapon.bind(player);
            player.hitUserPlayer = this.hitUserPlayer.bind(player);
            player.hitAFoe = this.hitAFoe.bind(player);
            player.triggerAttack = this.triggerAttack.bind(player);
            player.attack = this.attack.bind(player);
            player.initWeapon(this.hitAreaWidth, this.hitAreaHeight, this.debug);
        };
        MeleeWeapon.prototype.initWeapon = function (hitAreaWidth, hitAreaHeight, debug) {
            // the bitmapData of the hitArea
            var hitAreaBmd = this.game.add.bitmapData(hitAreaWidth, hitAreaHeight);
            hitAreaBmd.ctx.beginPath();
            hitAreaBmd.ctx.rect(0, 0, hitAreaWidth, hitAreaHeight);
            if (debug) {
                hitAreaBmd.ctx.fillStyle = '#ffffff';
                hitAreaBmd.ctx.fill();
            }
            // the sprite of the hitArea
            this.hitAreaSprite = this.weapon.create(0, 0, hitAreaBmd);
            this.hitAreaSprite.exists = false;
            this.hitAreaSprite.visible = false;
            this.hitAreaSprite.origin = {};
            this.hitAreaSprite.origin.x = this.x;
            this.hitAreaSprite.origin.y = this.y;
            this.hitAreaSprite.anchor.set(0.5);
            this.updateMethods['checkRangeFor' + this.weapon.weaponName] = function () {
                if (this.hitAreaSprite.alive) {
                    if (Phaser.Point.distance(this.hitAreaSprite.position, this.hitAreaSprite.origin, true) > this.weapon.range) {
                        this.hitAreaSprite.kill();
                    }
                }
            }.bind(this);
        };
        MeleeWeapon.prototype.hitUserPlayer = function (userPlayer, hitArea) {
            userPlayer.takeHit(this.weapon.damage, this.playerId);
            hitArea.kill();
        };
        MeleeWeapon.prototype.hitAFoe = function (hitArea, foePlayer) {
            hitArea.kill();
        };
        MeleeWeapon.prototype.triggerAttack = function () {
            var message = {
                playerId: this.playerId,
                targetX: this.game.input.worldX,
                targetY: this.game.input.worldY,
                x: this.x,
                y: this.y,
                type: 'attack',
                team: this.team
            };
            this.game.ws.send(message);
        };
        MeleeWeapon.prototype.attack = function (message) {
            var target = new Phaser.Point(message.targetX, message.targetY);
            var position = new Phaser.Point(message.x, message.y);
            this.changeSightPositionToPoint(target.x, target.y);
            this.hitAreaSprite.rotation = this.game.physics.arcade.angleBetween(position, target);
            this.hitAreaSprite.reset(position.x, position.y);
            this.hitAreaSprite.origin.x = position.x;
            this.hitAreaSprite.origin.y = position.y;
            //start the animation
            if (this.playWeaponAnimationTowards) {
                this.playWeaponAnimationTowards(target.x, target.y);
                this.stopMovement(position.x, position.y);
            }
            // the hitArea movement speed will be the distance in pixeles divided by the attackspeed in miliseconds
            // I want to change this to have the hitArea speed calculated different, but base on attackSpeed
            var speed = this.weapon.range / (this.weapon.attackSpeed / 1000);
            this.game.physics.arcade.moveToXY(this.hitAreaSprite, target.x, target.y, speed);
        };
        return MeleeWeapon;
    }());
    Rwg.MeleeWeapon = MeleeWeapon;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
var Rwg;
(function (Rwg) {
    var WeaponAnimations = (function () {
        function WeaponAnimations(upFrames, downFrames, leftFrames, rightFrames) {
            this.upFrames = upFrames;
            this.downFrames = downFrames;
            this.leftFrames = leftFrames;
            this.rightFrames = rightFrames;
        }
        WeaponAnimations.prototype.provide = function (game, player) {
            player.addWeaponAnim = this.addWeaponAnim.bind(player);
            player.playWeaponAnimationTowards = this.playWeaponAnimationTowards.bind(player);
            player.addWeaponAnim(this.upFrames, 'UpAttack');
            player.addWeaponAnim(this.downFrames, 'DownAttack');
            player.addWeaponAnim(this.leftFrames, 'LeftAttack');
            player.addWeaponAnim(this.rightFrames, 'RightAttack');
        };
        WeaponAnimations.prototype.addWeaponAnim = function (animFrames, animId) {
            // the weapon speed will determin how long the animation attack will last
            var fps = Math.floor(animFrames.length / (this.weapon.attackSpeed / 1000));
            // anim creation
            var anim = this.animations.add(this.weapon.weaponName + animId, animFrames, fps, false);
            // set cancel movement
            anim.onComplete.add(function () {
                this.continueMovement();
            }, this);
        };
        WeaponAnimations.prototype.playWeaponAnimationTowards = function (x, y) {
            switch (this.getSightPositionToPoint(x, y)) {
                case this.FacePositions.RIGHT:
                    this.play(this.weapon.weaponName + 'RightAttack');
                    break;
                case this.FacePositions.LEFT:
                    this.play(this.weapon.weaponName + 'LeftAttack');
                    break;
                case this.FacePositions.UP:
                    this.play(this.weapon.weaponName + 'UpAttack');
                    break;
                case this.FacePositions.DOWN:
                    this.play(this.weapon.weaponName + 'DownAttack');
            }
        };
        return WeaponAnimations;
    }());
    Rwg.WeaponAnimations = WeaponAnimations;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
var Rwg;
(function (Rwg) {
    var EnableKeyboardInput = (function () {
        function EnableKeyboardInput() {
        }
        EnableKeyboardInput.prototype.provide = function (player) {
            player.enableKeyboardInput = this.enableKeyboardInput.bind(player);
            player.enableKeyboardInput();
        };
        EnableKeyboardInput.prototype.enableKeyboardInput = function () {
            this.game.input.keyboard.addCallbacks(this, this.keyDownCallBack, this.keyUpCallBack, null);
        };
        return EnableKeyboardInput;
    }());
    Rwg.EnableKeyboardInput = EnableKeyboardInput;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
var Rwg;
(function (Rwg) {
    var PlayerMovementControls = (function () {
        function PlayerMovementControls(speed) {
            this.movementSpeed = speed;
        }
        PlayerMovementControls.prototype.provide = function (player) {
            player.movementSpeed = this.movementSpeed;
            player.MovemenrtControlEnable = true;
            player.initPlayerMovementControls = this.initPlayerMovementControls.bind(player);
            player.movementKeysOnDown = this.movementKeysOnDown.bind(player);
            player.movementKeysOnUp = this.movementKeysOnUp.bind(player);
            player.setVelocityForKey = this.setVelocityForKey.bind(player);
            player.sendUpdatePlayerPosition = this.sendUpdatePlayerPosition.bind(player);
            player.sendUpdatePlayerVelocity = this.sendUpdatePlayerVelocity.bind(player);
            player.getSignOfYVelocity = this.getSignOfYVelocity.bind(player);
            player.getSignOfXVelocity = this.getSignOfXVelocity.bind(player);
            player.initPlayerMovementControls();
        };
        PlayerMovementControls.prototype.initPlayerMovementControls = function () {
            // the factor to have the right speed when move in diagonal
            this.velocityComponent = Math.sin(Math.PI / 4);
            // this is not an stack at all since we are removing randomly, but the idea is to 
            // maintain the input order
            this.keyStack = new Array();
            this.movementKeys = [Phaser.KeyCode.A, Phaser.KeyCode.D, Phaser.KeyCode.W, Phaser.KeyCode.S];
            this.game.input.keyboard.addCallbacks(this, this.movementKeysOnDown, this.movementKeysOnUp, null);
            // adds the movement key capture methods to the key up and down methods list
            this.keyDownInputMethods['movementKeysOnDown'] = function (event) {
                this.movementKeysOnDown(event);
            }.bind(this);
            this.keyUpInputMethods['movementKeysOnUp'] = function (event) {
                this.movementKeysOnUp(event);
            }.bind(this);
        };
        PlayerMovementControls.prototype.movementKeysOnDown = function (event) {
            var keyCode = event.keyCode;
            if (this.movementKeys.indexOf(keyCode) != -1 && this.keyStack.indexOf(keyCode) == -1) {
                this.keyStack.push(event.keyCode);
                this.setVelocityForKey(event.keyCode);
            }
        };
        PlayerMovementControls.prototype.movementKeysOnUp = function (event) {
            var keyCode = event.keyCode;
            if (this.movementKeys.indexOf(keyCode) != -1) {
                this.keyStack.splice(this.keyStack.indexOf(event.keyCode), 1);
                if (this.keyStack.length == 0) {
                    this.sendUpdatePlayerPosition(this.x, this.y);
                }
                else {
                    // tops the last input
                    this.setVelocityForKey(this.keyStack[this.keyStack.length - 1]);
                }
            }
        };
        PlayerMovementControls.prototype.setVelocityForKey = function (keyCode) {
            // the keyStack continues doing the stacking, but the movement is not performed
            if (!this.MovemenrtControlEnable) {
                return;
            }
            var keySign = 1;
            if (keyCode == Phaser.KeyCode.A || keyCode == Phaser.KeyCode.W) {
                keySign = -1;
            }
            if (keyCode == Phaser.KeyCode.A || keyCode == Phaser.KeyCode.D) {
                if (this.keyStack.indexOf(Phaser.KeyCode.W) != -1 || this.keyStack.indexOf(Phaser.KeyCode.S) != -1) {
                    this.sendUpdatePlayerVelocity(this.movementSpeed * this.velocityComponent * keySign, this.movementSpeed * this.velocityComponent * this.getSignOfYVelocity());
                }
                else {
                    this.sendUpdatePlayerVelocity(this.movementSpeed * keySign, 0);
                }
            }
            else if (keyCode == Phaser.KeyCode.W || keyCode == Phaser.KeyCode.S) {
                if (this.keyStack.indexOf(Phaser.KeyCode.A) != -1 || this.keyStack.indexOf(Phaser.KeyCode.D) != -1) {
                    this.sendUpdatePlayerVelocity(this.movementSpeed * this.velocityComponent * this.getSignOfXVelocity(), this.movementSpeed * this.velocityComponent * keySign);
                }
                else {
                    this.sendUpdatePlayerVelocity(0, this.movementSpeed * keySign);
                }
            }
        };
        PlayerMovementControls.prototype.getSignOfYVelocity = function () {
            if (this.body.velocity.y != 0) {
                return Math.sign(this.body.velocity.y);
            }
            else {
                var indexOfW = this.keyStack.indexOf(Phaser.KeyCode.W);
                var indexOfS = this.keyStack.indexOf(Phaser.KeyCode.S);
                if (indexOfW > indexOfS) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
        };
        PlayerMovementControls.prototype.getSignOfXVelocity = function () {
            if (this.body.velocity.x != 0) {
                return Math.sign(this.body.velocity.x);
            }
            else {
                var indexOfA = this.keyStack.indexOf(Phaser.KeyCode.A);
                var indexOfD = this.keyStack.indexOf(Phaser.KeyCode.D);
                if (indexOfA > indexOfD) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
        };
        PlayerMovementControls.prototype.sendUpdatePlayerPosition = function (x, y) {
            this.game.ws.send({
                color: this.color,
                playerId: this.playerId,
                x: x,
                y: y,
                type: 'updatePlayerPosition',
                team: this.team,
                fightType: this.fightType
            });
        };
        PlayerMovementControls.prototype.sendUpdatePlayerVelocity = function (x, y) {
            this.game.ws.send({
                color: this.color,
                playerId: this.playerId,
                velocityX: x,
                velocityY: y,
                x: this.x,
                y: this.y,
                type: 'updatePlayerVelocity',
                team: this.team,
                fightType: this.fightType
            });
        };
        return PlayerMovementControls;
    }());
    Rwg.PlayerMovementControls = PlayerMovementControls;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
var Rwg;
(function (Rwg) {
    var PlayerAttackControls = (function () {
        function PlayerAttackControls() {
        }
        PlayerAttackControls.prototype.provide = function (player) {
            player.initAttackControls = this.initAttackControls.bind(player);
            player.attackControlsEnabled = true;
            player.attackTime = 0;
            // this value will be overwrite once the weapon had been provided
            player.weapon.coolDown = 500;
            player.initAttackControls();
        };
        PlayerAttackControls.prototype.initAttackControls = function () {
            this.updateMethods['leftClickAttack'] = function () {
                if (this.game.input.activePointer.leftButton.isDown && this.attackControlsEnabled &&
                    this.game.time.now > this.attackTime) {
                    // this method is in the weapon provider object
                    this.triggerAttack();
                    this.attackTime = this.game.time.now + this.weapon.coolDown;
                }
            }.bind(this);
        };
        return PlayerAttackControls;
    }());
    Rwg.PlayerAttackControls = PlayerAttackControls;
})(Rwg || (Rwg = {}));
/// <reference path="UserPlayer.ts" />
/// <reference path="../weapons/RangedWeapon.ts" />
/// <reference path="../weapons/MeleeWeapon.ts" />
/// <reference path="../weapons/WeaponAnimations.ts" />
/// <reference path="../controls/EnableKeyboardInput.ts" />
/// <reference path="../controls/PlayerMovementControls.ts" />
/// <reference path="../controls/PlayerAttackControls.ts" />
var Rwg;
(function (Rwg) {
    var PlayerFactory = (function () {
        function PlayerFactory() {
        }
        PlayerFactory.createUserPlayer = function (game, data) {
            game.userPlayer = new Rwg.UserPlayer(game, data.x, data.y);
            game.userPlayer.team = data.team;
            game.userPlayer.setColor(data.color);
            game.userPlayer.setPlayerId(data.playerId);
            game.userPlayer.fightType = data.fightType;
            (new Rwg.EnableKeyboardInput).provide(game.userPlayer);
            (new Rwg.PlayerMovementControls(300)).provide(game.userPlayer);
            (new Rwg.PlayerAttackControls()).provide(game.userPlayer);
            if (data.fightType == 'melee') {
                var melee = new Rwg.MeleeWeapon('sword', 20, 50, 500, 800, 30, 100, true);
                melee.provide(game, game.userPlayer);
                var animations = new Rwg.WeaponAnimations([0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], true);
                animations.provide(game, game.userPlayer);
                this.movementSpeed = 350;
            }
            else {
                var ranged = new Rwg.RangedWeapon('machineGun', 8, 500, 200, 300, 3, 750, 30, 5, true);
                ranged.provide(game, game.userPlayer);
                var animations = new Rwg.WeaponAnimations([0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], true);
                animations.provide(game, game.userPlayer);
            }
        };
        PlayerFactory.createPlayer = function (game, data) {
            var newPlayer = new Rwg.Player(game, data.x, data.y);
            newPlayer.team = data.team;
            newPlayer.setColor(data.color);
            newPlayer.setPlayerId(data.playerId);
            newPlayer.fightType = data.fightType;
            if (newPlayer.team == game.userPlayer.team) {
                game.allyPlayers.add(newPlayer);
            }
            else {
                game.foePlayers.add(newPlayer);
            }
            if (newPlayer.fightType == 'melee') {
                var melee = new Rwg.MeleeWeapon('sword', 20, 50, 500, 800, 30, 100, true);
                melee.provide(game, newPlayer);
                var animations = new Rwg.WeaponAnimations([0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], true);
                animations.provide(game, newPlayer);
            }
            else {
                var ranged = new Rwg.RangedWeapon('machineGun', 8, 500, 200, 200, 3, 750, 30, 5, true);
                ranged.provide(game, newPlayer);
                var animations = new Rwg.WeaponAnimations([0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], true);
                animations.provide(game, newPlayer);
            }
        };
        return PlayerFactory;
    }());
    Rwg.PlayerFactory = PlayerFactory;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    var PlayersGroup = (function (_super) {
        __extends(PlayersGroup, _super);
        function PlayersGroup(game) {
            _super.call(this, game);
            this.game.physics.arcade.enable(this);
            this.enableBody = true;
        }
        PlayersGroup.prototype.getPlayerById = function (playerId) {
            for (var i = 0; i < this.hash.length; i++) {
                if (playerId == this.hash[i].playerId) {
                    return this.hash[i];
                }
            }
            return null;
        };
        PlayersGroup.prototype.playerIdExists = function (playerId) {
            for (var i = 0; i < this.hash.length; i++) {
                if (playerId == this.hash[i].playerId) {
                    return true;
                }
            }
            return null;
        };
        return PlayersGroup;
    }(Phaser.Group));
    Rwg.PlayersGroup = PlayersGroup;
})(Rwg || (Rwg = {}));
/// <reference path="../players/PlayerFactory.ts" />
/// <reference path="../players/PlayersGroup.ts" />
var Rwg;
(function (Rwg) {
    var Arena1 = (function (_super) {
        __extends(Arena1, _super);
        function Arena1() {
            _super.apply(this, arguments);
        }
        Arena1.prototype.init = function (initParam) {
            // creates the user player
            Rwg.PlayerFactory.createUserPlayer(this.game, initParam);
        };
        Arena1.prototype.create = function () {
            // scenario setings
            this.game.world.setBounds(0, 0, 1920, 1920);
            this.background = this.game.add.tileSprite(0, 0, 1920, 1920, 'background');
            this.background.sendToBack();
            // initializes the forPlayers group for this state
            this.game.foePlayers = new Rwg.PlayersGroup(this.game);
            this.game.allyPlayers = new Rwg.PlayersGroup(this.game);
            // hoock websocket methods
            this.game.ws.updatePlayerPosition = this.updatePlayerPosition.bind(this);
            this.game.ws.updatePlayerVelocity = this.updatePlayerVelocity.bind(this);
            this.game.ws.attack = this.attack.bind(this);
            this.game.ws.playerKilled = this.playerKilled.bind(this);
            this.game.ws.removePlayer = this.removePlayer.bind(this);
            // set the camara
            this.game.camera.follow(this.game.userPlayer);
            // for debugin
            this.servermessages = 0;
            this.game.ws.debug = this.debug.bind(this);
        };
        Arena1.prototype.updatePlayerPosition = function (message) {
            if (message.playerId == this.game.userPlayer.playerId) {
                this.game.userPlayer.updatePlayerPosition(message.x, message.y);
                return;
            }
            var player = this.getPlayer(message);
            if (player == null) {
                Rwg.PlayerFactory.createPlayer(this.game, message);
                this.reorderWeaponSprites();
            }
            else {
                player.updatePlayerPosition(message.x, message.y);
            }
        };
        Arena1.prototype.updatePlayerVelocity = function (message) {
            if (message.playerId == this.game.userPlayer.playerId) {
                this.game.userPlayer.updatePlayerVelocity(message.velocityX, message.velocityY, message.x, message.y);
                return;
            }
            var player = this.getPlayer(message);
            if (player == null) {
                Rwg.PlayerFactory.createPlayer(this.game, message);
                this.reorderWeaponSprites();
            }
            else {
                player.updatePlayerVelocity(message.velocityX, message.velocityY, message.x, message.y);
            }
        };
        Arena1.prototype.playerKilled = function (message) {
            // if it is my own killed message I do nothing
            if (message.playerId == this.game.userPlayer.playerId) {
                return;
            }
            // if it was my kill
            if (message.killedBy == this.game.userPlayer.playerId) {
                this.game.userPlayer.addAKill();
            }
        };
        // if recieves attack message from server perform the attack
        Arena1.prototype.attack = function (message) {
            if (message.playerId == this.game.userPlayer.playerId) {
                this.game.userPlayer.attack(message);
                return;
            }
            var player = this.getPlayer(message);
            if (player !== null) {
                player.attack(message);
            }
        };
        // if recieves player leave from server updates the player list
        Arena1.prototype.removePlayer = function (message) {
            var foe = this.game.foePlayers.getPlayerById(message.playerId);
            if (foe !== null) {
                foe.destroyPlayer();
                this.game.foePlayers.remove(foe);
            }
        };
        Arena1.prototype.debug = function () {
            this.game.debug.text('server messages : ' + this.servermessages++, 32, 128);
        };
        /*
         *
         *  UTILITY METHODS
         *
         */
        Arena1.prototype.getPlayer = function (data) {
            var player = null;
            if (data.team == this.game.userPlayer.team) {
                player = this.game.allyPlayers.getPlayerById(data.playerId);
            }
            else {
                player = this.game.foePlayers.getPlayerById(data.playerId);
            }
            return player;
        };
        Arena1.prototype.reorderWeaponSprites = function () {
            this.background.sendToBack();
            this.game.world.bringToTop(this.game.userPlayer);
            this.game.foePlayers.forEach(function (member) {
                if (member.weaponSprite != null) {
                    this.game.world.bringToTop(member.weaponSprite);
                }
            }, this, true);
            if (this.game.userPlayer.weaponSprite != null) {
                this.game.world.bringToTop(this.game.userPlayer.weaponSprite);
            }
            this.game.world.bringToTop(this.game.userPlayer.uiMask);
        };
        return Arena1;
    }(Phaser.State));
    Rwg.Arena1 = Arena1;
})(Rwg || (Rwg = {}));
/// <reference path="../../libs/phaser.d.ts" />
/// <reference path="states/StartScreen.ts" />
/// <reference path="states/Arena1.ts" />
/// <reference path="players/UserPlayer.ts" />
/// <reference path="players/PlayerGroup.ts" />
var Rwg;
(function (Rwg) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game(ws) {
            _super.call(this, 800, 600, Phaser.AUTO, 'canvas-area');
            this.ws = ws;
            this.state.add('StartScreen', Rwg.StartScreen, false);
            this.state.add('Arena1', Rwg.Arena1, false);
            this.state.start('StartScreen');
        }
        return Game;
    }(Phaser.Game));
    Rwg.Game = Game;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    var WSConnection = (function () {
        function WSConnection(uri) {
            this.init = function (message) {
                // empty method to be overwrite
            };
            this.updatePlayerPosition = function (message) {
                // empty method to be overwrite
            };
            this.updatePlayerVelocity = function (message) {
                // empty method to be overwrite
            };
            this.removePlayer = function (message) {
                // empty method to be overwrite
            };
            this.requestEnter = function (message) {
                // empty method to be overwrite
            };
            this.attack = function (message) {
                // empty method to be overwrite
            };
            this.playerKilled = function (message) {
                // empty method to be overwrite
            };
            this.debug = function (message) {
                // empty method to be overwrite
            };
            this.uri = uri;
        }
        WSConnection.prototype.connect = function () {
            this.conn = new WebSocket(this.uri);
            this.conn.onmessage = this.onMessage.bind(this);
        };
        WSConnection.prototype.onMessage = function (message) {
            var message = JSON.parse(message.data);
            this.debug(message);
            switch (message.type) {
                case 'init':
                    this.init(message);
                    break;
                case 'updatePlayerVelocity':
                    this.updatePlayerVelocity(message);
                    break;
                case 'updatePlayerPosition':
                    this.updatePlayerPosition(message);
                    break;
                case 'removePlayer':
                    this.removePlayer(message);
                    break;
                case 'requestEnter':
                    this.requestEnter(message);
                    break;
                case 'attack':
                    this.attack(message);
                    break;
                case 'playerKilled':
                    this.playerKilled(message);
                    break;
                default:
                    console.log('no type');
            }
        };
        WSConnection.prototype.send = function (message) {
            var message = JSON.stringify(message);
            this.conn.send(message);
        };
        return WSConnection;
    }());
    Rwg.WSConnection = WSConnection;
})(Rwg || (Rwg = {}));
/// <reference path="game/Game.ts" />
/// <reference path="game/serverconn/WSConnection.ts" />
window.onload = function () {
    var ws = new Rwg.WSConnection('ws://201.214.74.5:1337');
    ws.connect();
    var game = new Rwg.Game(ws);
};
