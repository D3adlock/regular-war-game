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
            this.game.load.spritesheet('arrow', '../assets/arrow.png', 32, 10, 1);
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
            if (this.textInput.text != '' && this.team != undefined) {
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
            // visual sprite options
            this.anchor.setTo(0.5, 0.5);
            this.scale.setTo(1.5, 1.5);
            this.game.add.existing(this);
            // init attack and skill sets
            this.activeAttack = this.game.add.physicsGroup();
            this.skills = {};
            this.attacks = {};
            // init movement and click control values
            this.defaultLeftClickAction = null;
            this.currentLeftClickAction = null;
            this.keyDownInputMethods = {};
            this.keyUpInputMethods = {};
            this.keyStack = [];
            this.updateMethods = {};
            this.updateMethods['hitTheUserPlayer'] = function () {
                this.game.physics.arcade.overlap(this.activeAttack, this.game.userPlayer, this.hitUserPlayer, this.userPlayerIsInMyTeam, this);
            }.bind(this);
            this.updateMethods['hitAFoePlayer'] = function () {
                this.game.physics.arcade.overlap(this.activeAttack, this.game.foePlayers, this.hitAFoe, this.hitMyselfCheck, this);
            }.bind(this);
            this.updateMethods['mapLimits'] = function () {
                if (this.y < 150) {
                    this.y = 150;
                }
            }.bind(this);
            /*
             * visual configuration
             */
            this.createWalkAnimations();
            this.FacePositions = { LEFT: 1, RIGHT: 2, UP: 3, DOWN: 4 };
            // playerlabelname
            var style = { font: "16px Arial", fill: "#ffffff", wordWrap: true, align: "center" };
            this.playerNameLabel = this.game.add.text(x, y, '', style);
            this.playerNameLabel.anchor.set(0.5, 1.6);
            this.playerNameLabel.position = this.position;
            // methods for drawing the target circle in the player
            this.targetElipse = this.game.add.graphics(this.x, this.y);
            if (this.team == this.game.team) {
                this.targetElipse.lineStyle(2, 0x00ff00);
            }
            else {
                this.targetElipse.lineStyle(2, 0xff0000);
            }
            this.targetElipse.drawEllipse(0, 18, 40, 25);
            this.targetElipse.position = this.position;
            this.targetElipse.visible = false;
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
        Player.prototype.stopMovement = function () {
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
        /*
         *
         *  SETTERS
         *
         */
        Player.prototype.setColor = function (color) {
            this.color = color;
            this.tint = color;
        };
        Player.prototype.setPlayerId = function (playerId) {
            this.playerId = playerId;
            this.playerNameLabel.text = 'Team-' + this.team + ': ' + playerId;
        };
        /*
         *
         *  HIT DETECTION METHODS
         *
         */
        Player.prototype.hitUserPlayer = function (userPlayer, hitArea) {
            userPlayer.takeHit(this.attacks[hitArea.attackName].damage, this.playerId);
            if (this.attacks[hitArea.attackName].additionalEffect != null) {
                this.attacks[hitArea.attackName].additionalEffect(userPlayer);
            }
            hitArea.kill();
        };
        Player.prototype.hitAFoe = function (hitArea, foePlayer) {
            hitArea.kill();
        };
        Player.prototype.hitMyselfCheck = function (myAttack, attackedPlayer) {
            return this.playerId != attackedPlayer.playerId;
        };
        Player.prototype.userPlayerIsInMyTeam = function (userPlayer, myAttack) {
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
            // super important for hit detection
            this.game.physics.arcade.enable(this);
            this.body.collideWorldBounds = true;
            // delete this updateMethod wince it is not requiered for the userPlayer
            delete this.updateMethods['hitTheUserPlayer'];
            // update method only for user player
            this.updateMethods['leftClickAttack'] = function () {
                if (this.game.input.activePointer.leftButton.isDown && this.currentLeftClickAction != null) {
                    this.currentLeftClickAction();
                }
            }.bind(this);
            // skills target mechanics
            this.targetsOver = [];
            this.maxTargetsSelected = 3;
            game.input.keyboard.removeKeyCapture([Phaser.KeyCode.ESC]);
            var esc = game.input.keyboard.addKey(Phaser.KeyCode.ESC);
            esc.onDown.add(this.releaseTarget, this);
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
            // enables the keyboard inputs for the user player
            this.game.input.keyboard.addCallbacks(this, this.keyDownCallBack, this.keyUpCallBack, null);
        }
        // skills mechanics for player
        UserPlayer.prototype.targetOver = function (player) {
            if (this.targetEnabled && this.targetsOver.length < this.maxTargetsSelected) {
                this.targetsOver.push(player);
                player.targetElipse.visible = true;
            }
        };
        UserPlayer.prototype.releaseTarget = function (player) {
            for (var i = 0; i < this.targetsOver.length; i++) {
                this.targetsOver[i].targetElipse.visible = false;
            }
            this.targetsOver = [];
            this.targetEnabled = false;
            this.attackControlsEnabled = true;
        };
        UserPlayer.prototype.addTargetable = function (newPlayer) {
            newPlayer.events.onInputOver.add(this.targetOver, this);
            newPlayer.inputEnabled = true;
        };
        // player life checkers
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
            this.sendUpdatePlayerPosition(80, 80);
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
            this.updatePlayerPosition(x, y);
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
            this.updatePlayerVelocity(x, y, this.x, this.y);
        };
        return PlayerMovementControls;
    }());
    Rwg.PlayerMovementControls = PlayerMovementControls;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
var Rwg;
(function (Rwg) {
    var TargetSkill = (function () {
        function TargetSkill(skillName, damage, range, castingSpeed, coolDown, castKey, maxTargetsSelected, effect) {
            this.skillName = skillName;
            this.damage = damage;
            this.range = range;
            this.castingSpeed = castingSpeed;
            this.coolDown = coolDown;
            this.castKey = castKey;
            this.maxTargetsSelected = maxTargetsSelected;
            this.effect = effect;
        }
        TargetSkill.prototype.provide = function (game, player) {
            player.skills[this.skillName] = {};
            player.skills[this.skillName].damage = this.damage;
            player.skills[this.skillName].range = this.range;
            player.skills[this.skillName].castingSpeed = this.castingSpeed;
            player.skills[this.skillName].coolDown = this.coolDown;
            player.skills[this.skillName].castKey = this.castKey;
            player.skills[this.skillName].maxTargetsSelected = this.maxTargetsSelected;
            player.skills[this.skillName].coolDownTime = 0;
            var key = game.input.keyboard.addKey(this.castKey);
            key.onDown.add(this.onKeyDownMethod(), player);
            var effect = this.effect;
            // the effect on player method
            player.updateMethods[this.skillName + 'Fire'] = function () {
                if (this.game.input.activePointer.leftButton.isDown && this.targetEnabled
                    && this.targetsOver.length > 0) {
                    effect(this.targetsOver);
                    this.releaseTarget();
                }
            }.bind(player);
        };
        TargetSkill.prototype.onKeyDownMethod = function () {
            var skillName = this.skillName;
            return function (event) {
                if (this.game.time.now > this.skills[skillName].coolDownTime) {
                    // set the target values
                    this.maxTargetsSelected = this.skills[skillName].maxTargetsSelected;
                    this.targetsOver = [];
                    this.targetEnabled = true;
                    this.attackControlsEnabled = false;
                    this.skills[skillName].coolDownTime = this.game.time.now + this.skills[skillName].coolDown;
                }
                else {
                    console.log('skill not ready yet');
                }
            };
        };
        return TargetSkill;
    }());
    Rwg.TargetSkill = TargetSkill;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
var Rwg;
(function (Rwg) {
    var PlayerAnimationFactory = (function () {
        function PlayerAnimationFactory(animId, cancelMovement, upFrames, downFrames, leftFrames, rightFrames) {
            this.animId = animId;
            this.cancelMovement = cancelMovement;
            this.upFrames = upFrames;
            this.downFrames = downFrames;
            this.leftFrames = leftFrames;
            this.rightFrames = rightFrames;
        }
        PlayerAnimationFactory.prototype.getPlayAnimationTowardsMethod = function (player, attackSpeed) {
            var animId = this.animId;
            this.createAnimation(player, attackSpeed, this.upFrames, animId + 'UpPlayerAnim', this.cancelMovement);
            this.createAnimation(player, attackSpeed, this.downFrames, animId + 'DownPlayerAnim', this.cancelMovement);
            this.createAnimation(player, attackSpeed, this.leftFrames, animId + 'LeftPlayerAnim', this.cancelMovement);
            this.createAnimation(player, attackSpeed, this.rightFrames, animId + 'RightPlayerAnim', this.cancelMovement);
            return function (x, y) {
                switch (this.getSightPositionToPoint(x, y)) {
                    case this.FacePositions.RIGHT:
                        this.play(animId + 'RightPlayerAnim');
                        break;
                    case this.FacePositions.LEFT:
                        this.play(animId + 'LeftPlayerAnim');
                        break;
                    case this.FacePositions.UP:
                        this.play(animId + 'UpPlayerAnim');
                        break;
                    case this.FacePositions.DOWN:
                        this.play(animId + 'DownPlayerAnim');
                }
            };
        };
        PlayerAnimationFactory.prototype.createAnimation = function (player, attackSpeed, animFrames, subAnimId, cancelMovement) {
            var fps = Math.floor(animFrames.length / (attackSpeed / 1000));
            var anim = player.animations.add(subAnimId, animFrames, fps, false);
            // set cancel movement
            if (cancelMovement) {
                anim.onComplete.add(function () {
                    this.continueMovement();
                }, player);
                anim.onStart.add(function () {
                    this.stopMovement();
                }, player);
            }
        };
        return PlayerAnimationFactory;
    }());
    Rwg.PlayerAnimationFactory = PlayerAnimationFactory;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
/// <reference path="../animations/PlayerAnimationFactory.ts" />
var Rwg;
(function (Rwg) {
    var MeleeAttack = (function () {
        function MeleeAttack(attackName, damage, range, attackSpeed, coolDown, hitAreaWidth, hitAreaHeight, activeAttackKey, debug) {
            this.attackName = attackName;
            this.damage = damage;
            this.range = range;
            this.attackSpeed = attackSpeed;
            this.coolDown = coolDown;
            this.hitAreaWidth = hitAreaWidth;
            this.hitAreaHeight = hitAreaHeight;
            this.activeAttackKey = activeAttackKey;
            this.debug = debug;
        }
        MeleeAttack.prototype.provide = function (game, player) {
            // create a new attack in the attack list
            player.attacks[this.attackName] = {};
            player.attacks[this.attackName].attackTime = 0;
            player.attacks[this.attackName].coolDown = this.coolDown;
            player.attacks[this.attackName].damage = this.damage;
            player.attacks[this.attackName].attackSpeed = this.attackSpeed;
            player.attacks[this.attackName].range = this.range;
            // generate the attack hit area sprite
            player.attacks[this.attackName].hitAreaSprite = player.activeAttack.create(0, 0, this.createHitAreBmd(game, this.hitAreaWidth, this.hitAreaHeight, this.debug));
            player.attacks[this.attackName].hitAreaSprite.exists = false;
            player.attacks[this.attackName].hitAreaSprite.visible = false;
            player.attacks[this.attackName].hitAreaSprite.origin = {};
            player.attacks[this.attackName].hitAreaSprite.origin.x = this.x;
            player.attacks[this.attackName].hitAreaSprite.origin.y = this.y;
            player.attacks[this.attackName].hitAreaSprite.anchor.set(0.5);
            player.attacks[this.attackName].hitAreaSprite.attackName = this.attackName;
            // generates the method callbacks for the attack
            player.attacks[this.attackName].attack = this.getAttackMethod(this.attackName).bind(player);
            player.attacks[this.attackName].triggerAttack = this.getTriggerAttackMethod(this.attackName).bind(player);
            player.attacks[this.attackName].additionalEffect = null;
            // the method to check the range of the hit area
            player.updateMethods['checkRangeFor' + this.attackName] = this.getCheckRangeForAttackMethod(this.attackName).bind(player);
            // methods for attack base on key activation
            if (this.activeAttackKey == null) {
                player.defaultLeftClickAction = player.attacks[this.attackName].triggerAttack.bind(player);
                player.currentLeftClickAction = player.attacks[this.attackName].triggerAttack.bind(player);
            }
            else {
                var key = game.input.keyboard.addKey(this.activeAttackKey);
                key.onDown.add(this.getAttackSelectedMethod(this.attackName), player);
            }
            // creates the animation method for this attack
            var animationFactory = new Rwg.PlayerAnimationFactory(this.attackName, true, this.upFrames, this.downFrames, this.leftFrames, this.rightFrames);
            player.attacks[this.attackName].playAttackAnimationTowards =
                animationFactory.getPlayAnimationTowardsMethod(player, this.attackSpeed).bind(player);
        };
        MeleeAttack.prototype.getAttackMethod = function (attackName) {
            return function (message) {
                var target = new Phaser.Point(message.targetX, message.targetY);
                var position = new Phaser.Point(message.x, message.y);
                this.changeSightPositionToPoint(target.x, target.y);
                this.attacks[attackName].hitAreaSprite.rotation = this.game.physics.arcade.angleBetween(position, target);
                this.attacks[attackName].hitAreaSprite.reset(position.x, position.y);
                this.attacks[attackName].hitAreaSprite.origin.x = position.x;
                this.attacks[attackName].hitAreaSprite.origin.y = position.y;
                //start the animation
                if (this.attacks[attackName].playAttackAnimationTowards != null) {
                    this.attacks[attackName].playAttackAnimationTowards(target.x, target.y);
                }
                // the hitArea movement speed will be the distance in pixeles divided by the attackspeed in miliseconds
                // I want to change this to have the hitArea speed calculated different, but base on attackSpeed
                var speed = this.attacks[attackName].range / (this.attacks[attackName].attackSpeed / 1000);
                this.game.physics.arcade.moveToXY(this.attacks[attackName].hitAreaSprite, target.x, target.y, speed);
            };
        };
        MeleeAttack.prototype.getTriggerAttackMethod = function (attackName) {
            return function () {
                if (this.game.time.now > this.attacks[attackName].attackTime) {
                    var message = {
                        playerId: this.playerId,
                        attackName: attackName,
                        targetX: this.game.input.worldX,
                        targetY: this.game.input.worldY,
                        x: this.x,
                        y: this.y,
                        type: 'attack',
                        team: this.team
                    };
                    this.game.ws.send(message);
                    this.attacks[attackName].attack(message);
                    this.attacks[attackName].attackTime = this.game.time.now + this.attacks[attackName].coolDown;
                }
            };
        };
        MeleeAttack.prototype.getCheckRangeForAttackMethod = function (attackName) {
            return function () {
                if (this.attacks[attackName].hitAreaSprite.alive) {
                    if (Phaser.Point.distance(this.attacks[attackName].hitAreaSprite.position, this.attacks[attackName].hitAreaSprite.origin, true) > this.attacks[attackName].range) {
                        this.attacks[attackName].hitAreaSprite.kill();
                    }
                }
            };
        };
        MeleeAttack.prototype.getAttackSelectedMethod = function (attackName) {
            return function () {
                this.currentLeftClickAction = this.attacks[attackName].triggerAttack;
            };
        };
        // creates the hit area bitmapdata
        MeleeAttack.prototype.createHitAreBmd = function (game, hitAreaWidth, hitAreaHeight, debug) {
            var hitAreaBmd = game.add.bitmapData(hitAreaWidth, hitAreaHeight);
            hitAreaBmd.ctx.beginPath();
            hitAreaBmd.ctx.rect(0, 0, hitAreaWidth, hitAreaHeight);
            if (debug) {
                hitAreaBmd.ctx.fillStyle = '#ffffff';
                hitAreaBmd.ctx.fill();
            }
            return hitAreaBmd;
        };
        return MeleeAttack;
    }());
    Rwg.MeleeAttack = MeleeAttack;
})(Rwg || (Rwg = {}));
/// <reference path="Player.ts" />
/// <reference path="../animations/PlayerAnimationFactory.ts" />
var Rwg;
(function (Rwg) {
    var RangedAttack = (function () {
        function RangedAttack() {
        }
        RangedAttack.prototype.provide = function (game, player) {
            // create a new attack in the attack list
            player.attacks[this.attackName] = {};
            player.attacks[this.attackName].attackTime = 0;
            player.attacks[this.attackName].coolDown = this.coolDown;
            player.attacks[this.attackName].damage = this.damage;
            player.attacks[this.attackName].attackSpeed = this.attackSpeed;
            player.attacks[this.attackName].range = this.range;
            player.attacks[this.attackName].bulletSpeed = this.bulletSpeed;
            // generate the attack hit area sprites
            // player.attacks[this.attackName].hitAreaSprites = game.add.physicsGroup();
            // player.activeAttack.addChild(player.attacks[this.attackName].hitAreaSprites);
            for (var i = 0; i < this.cadence; i++) {
                var bullet = player.activeAttack.create(0, 0, this.bulletSpriteName);
                bullet.exists = false;
                bullet.visible = false;
                bullet.origin = {};
                bullet.origin.x = this.x;
                bullet.origin.y = this.y;
                bullet.anchor.set(0.5);
                bullet.attackName = this.attackName;
            }
            // generates the method callbacks for the attack
            player.attacks[this.attackName].attack = this.getAttackMethod(this.attackName).bind(player);
            player.attacks[this.attackName].triggerAttack = this.getTriggerAttackMethod(this.attackName).bind(player);
            player.attacks[this.attackName].additionalEffect = null;
            // the method to check the range of the hit area
            player.updateMethods['checkRangeFor' + this.attackName] = this.getCheckRangeForAttackMethod(this.attackName).bind(player);
            // methods for attack base on key activation
            if (this.activeAttackKey == null) {
                player.defaultLeftClickAction = player.attacks[this.attackName].triggerAttack.bind(player);
                player.currentLeftClickAction = player.attacks[this.attackName].triggerAttack.bind(player);
            }
            else {
                var key = game.input.keyboard.addKey(this.activeAttackKey);
                key.onDown.add(this.getAttackSelectedMethod(this.attackName), player);
            }
            // creates the animation method for this attack
            var animationFactory = new Rwg.PlayerAnimationFactory(this.attackName, true, this.upFrames, this.downFrames, this.leftFrames, this.rightFrames);
            player.attacks[this.attackName].playAttackAnimationTowards =
                animationFactory.getPlayAnimationTowardsMethod(player, this.attackSpeed).bind(player);
        };
        RangedAttack.prototype.getAttackMethod = function (attackName) {
            return function (message) {
                var target = new Phaser.Point(message.targetX, message.targetY);
                var position = new Phaser.Point(message.x, message.y);
                this.changeSightPositionToPoint(target.x, target.y);
                var hitAreaSprite = this.activeAttack.next();
                while (hitAreaSprite.attackName != attackName) {
                    hitAreaSprite = this.activeAttack.next();
                }
                if (hitAreaSprite) {
                    hitAreaSprite.rotation = this.game.physics.arcade.angleBetween(position, target);
                    hitAreaSprite.reset(position.x, position.y);
                    hitAreaSprite.origin.x = position.x;
                    hitAreaSprite.origin.y = position.y;
                    //start the animation
                    if (this.attacks[attackName].playAttackAnimationTowards != null) {
                        this.attacks[attackName].playAttackAnimationTowards(target.x, target.y);
                    }
                    this.game.physics.arcade.moveToXY(hitAreaSprite, target.x, target.y, this.attacks[attackName].bulletSpeed);
                }
            };
        };
        RangedAttack.prototype.getTriggerAttackMethod = function (attackName) {
            return function () {
                if (this.game.time.now > this.attacks[attackName].attackTime) {
                    var message = {
                        playerId: this.playerId,
                        attackName: attackName,
                        targetX: this.game.input.worldX,
                        targetY: this.game.input.worldY,
                        x: this.x,
                        y: this.y,
                        type: 'attack',
                        team: this.team
                    };
                    this.game.ws.send(message);
                    this.attacks[attackName].attack(message);
                    this.attacks[attackName].attackTime = this.game.time.now + this.attacks[attackName].coolDown;
                }
            };
        };
        RangedAttack.prototype.getCheckRangeForAttackMethod = function (attackName) {
            return function () {
                this.activeAttack.forEach(function (member, range) {
                    if (member.alive && member.attackName == attackName) {
                        if (Phaser.Point.distance(member.position, member.origin, true) > range) {
                            member.kill();
                        }
                    }
                }, this, true, this.attacks[attackName].range);
            };
        };
        RangedAttack.prototype.getAttackSelectedMethod = function (attackName) {
            return function () {
                this.currentLeftClickAction = this.attacks[attackName].triggerAttack;
            };
        };
        return RangedAttack;
    }());
    Rwg.RangedAttack = RangedAttack;
})(Rwg || (Rwg = {}));
/// <reference path="UserPlayer.ts" />
/// <reference path="../controls/PlayerMovementControls.ts" />
/// <reference path="../skills/TargetSkill.ts" />
/// <reference path="../attacks/MeleeAttack.ts" />
/// <reference path="../attacks/RangedAttack.ts" />
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
            // controlls
            (new Rwg.PlayerMovementControls(300)).provide(game.userPlayer);
            // skills
            // let targetSkill = new TargetSkill('test', 0, 100, 100, 2000, Phaser.KeyCode.E, 2, function(targets){console.log(targets)});
            // targetSkill.provide(game, game.userPlayer);
            if (data.fightType == 'melee') {
                PlayerFactory.allAttacks(game, game.userPlayer);
                game.userPlayer.currentLeftClickAction = game.userPlayer.attacks['sword'].triggerAttack.bind(game.userPlayer);
            }
            else if (data.fightType == 'ranged') {
                PlayerFactory.allAttacks(game, game.userPlayer);
                game.userPlayer.currentLeftClickAction = game.userPlayer.attacks['bow'].triggerAttack.bind(game.userPlayer);
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
            PlayerFactory.allAttacks(game, newPlayer);
            // every time there is a new player it has to add the targeteable element
            game.userPlayer.addTargetable(newPlayer);
        };
        PlayerFactory.allAttacks = function (game, player) {
            var melee = new Rwg.MeleeAttack();
            melee.attackName = 'sword';
            melee.damage = 20;
            melee.range = 50;
            melee.attackSpeed = 300;
            melee.coolDown = 800;
            melee.hitAreaWidth = 30;
            melee.hitAreaHeight = 100;
            melee.activeAttackKey = Phaser.KeyCode.Q;
            melee.debug = true;
            melee.upFrames = [0, 4, 8, 12];
            melee.downFrames = [0, 4, 8, 12];
            melee.leftFrames = [0, 4, 8, 12];
            melee.rightFrames = [0, 4, 8, 12];
            melee.provide(game, player);
            var ranged = new Rwg.RangedAttack();
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
            ranged.upFrames = [0, 4, 8, 12];
            ranged.downFrames = [0, 4, 8, 12];
            ranged.leftFrames = [0, 4, 8, 12];
            ranged.rightFrames = [0, 4, 8, 12];
            ranged.provide(game, player);
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
            this.game.stage.disableVisibilityChange = true;
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
            this.gameTime = 0;
        };
        Arena1.prototype.updatePlayerPosition = function (message) {
            if (message.playerId == this.game.userPlayer.playerId) {
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
                return;
            }
            var player = this.getPlayer(message);
            if (player !== null) {
                player.attacks[message.attackName].attack(message);
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
        /*
         *
         * Debug methods
         *
         */
        Arena1.prototype.update = function () {
            if (this.game.time.now > this.gameTime) {
                this.game.debug.text('download : ' + this.game.ws.messagesByteDataReceived / 1000 + ' (Kb/s)', 32, 128);
                this.game.debug.text('upload : ' + this.game.ws.messagesByteDataSend / 1000 + " (Kb/s)", 32, 148);
                this.game.ws.messagesByteDataReceived = 0;
                this.game.ws.messagesByteDataSend = 0;
                this.gameTime = this.game.time.now + 1000;
            }
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
            this.game.foePlayers.forEach(function (member) {
                this.game.world.bringToTop(member.targetElipse);
            }, this, true);
            this.game.foePlayers.forEach(function (member) {
                this.game.world.bringToTop(member.key);
            }, this, true);
            this.game.world.bringToTop(this.game.userPlayer);
            this.game.foePlayers.forEach(function (member) {
                if (member.weaponSprite != null) {
                    this.game.world.bringToTop(member.weaponSprite);
                }
            }, this, true);
            if (this.game.userPlayer.weaponSprite != null) {
                this.game.world.bringToTop(this.game.userPlayer.weaponSprite);
            }
            this.game.foePlayers.forEach(function (member) {
                this.game.world.bringToTop(member.playerNameLabel);
            }, this, true);
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
            this.messagesByteDataSend = 0;
            this.messagesByteDataReceived = 0;
        }
        WSConnection.prototype.connect = function () {
            this.conn = new WebSocket(this.uri);
            this.conn.onmessage = this.onMessage.bind(this);
        };
        WSConnection.prototype.onMessage = function (message) {
            this.messagesByteDataReceived += this.lengthInUtf8Bytes(message.data);
            var message = JSON.parse(message.data);
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
            this.messagesByteDataSend += this.lengthInUtf8Bytes(message);
        };
        WSConnection.prototype.lengthInUtf8Bytes = function (str) {
            // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
            var m = encodeURIComponent(str).match(/%[89ABab]/g);
            return str.length + (m ? m.length : 0);
        };
        return WSConnection;
    }());
    Rwg.WSConnection = WSConnection;
})(Rwg || (Rwg = {}));
/// <reference path="game/Game.ts" />
/// <reference path="game/serverconn/WSConnection.ts" />
window.onload = function () {
    var ws = new Rwg.WSConnection('ws://localhost:1337');
    ws.connect();
    var game = new Rwg.Game(ws);
};
