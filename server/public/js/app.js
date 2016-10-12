var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Rwg;
(function (Rwg) {
    var Boot = (function (_super) {
        __extends(Boot, _super);
        function Boot() {
            _super.apply(this, arguments);
        }
        Boot.prototype.preload = function () {
            this.game.load.atlas('link2', '../assets/link2.png', '../assets/link2.json');
            this.game.load.atlas('uiAtlas', '../assets/uiAtlas.png', '../assets/uiAtlas.json');
            this.game.load.atlas('charIcons', '../assets/charIcons.png', '../assets/charIcons.json');
            this.game.load.atlas('arenaIcons', '../assets/arenaIcons.png', '../assets/arenaIcons.json');
            this.game.load.image('background', '../assets/background.png');
            this.game.load.spritesheet('arrow', '../assets/arrow.png', 32, 10, 1);
            this.game.load.spritesheet('target', '../assets/target.png', 48, 48, 1);
            this.game.load.tilemap('forestTownJSON', '../assets/forestTown.json', null, Phaser.Tilemap.TILED_JSON);
            this.game.load.image('forestTownImage', '../assets/forestTown.png');
        };
        Boot.prototype.create = function () {
            this.game.physics.startSystem(Phaser.Physics.BOX2D);
            this.game.state.start('EnterName', true, false);
            // this.game.state.start('GameOver', true, false);
        };
        return Boot;
    }(Phaser.State));
    Rwg.Boot = Boot;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    (function (MessageType) {
        MessageType[MessageType["NAME_SELECTION"] = 9] = "NAME_SELECTION";
        MessageType[MessageType["CHARACTER_SELECTION"] = 10] = "CHARACTER_SELECTION";
        MessageType[MessageType["ARENA_SELECTION"] = 11] = "ARENA_SELECTION";
        MessageType[MessageType["NEW_PLAYER"] = 3] = "NEW_PLAYER";
        MessageType[MessageType["REQUEST_PLAYER_INFO"] = 2] = "REQUEST_PLAYER_INFO";
        MessageType[MessageType["PLAYER_LEFT"] = 12] = "PLAYER_LEFT";
        MessageType[MessageType["MOVE"] = 4] = "MOVE";
        MessageType[MessageType["VELOCITY"] = 5] = "VELOCITY";
        MessageType[MessageType["ATTACK"] = 6] = "ATTACK";
        MessageType[MessageType["SKILL"] = 7] = "SKILL";
        MessageType[MessageType["DAMAGE"] = 8] = "DAMAGE";
        MessageType[MessageType["GAME_OVER"] = 1] = "GAME_OVER";
    })(Rwg.MessageType || (Rwg.MessageType = {}));
    var MessageType = Rwg.MessageType;
    ;
})(Rwg || (Rwg = {}));
/// <reference path="../core/enums/MessageType.ts" />
var Rwg;
(function (Rwg) {
    var EnterName = (function (_super) {
        __extends(EnterName, _super);
        function EnterName() {
            _super.apply(this, arguments);
        }
        EnterName.prototype.create = function () {
            var background = this.game.add.sprite(0, 0, 'background');
            var style = { font: "16px Arial", fill: "#ffffff", align: "center" };
            this.textInput = this.game.add.text(50, 100, '', style);
            this.game.input.keyboard.removeKeyCapture([8, 13]);
            var del = this.game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE);
            del.onDown.add(this.deleteLastLetter, this);
            var enter = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            enter.onDown.add(this.submit, this);
            this.game.input.keyboard.addCallbacks(this, null, null, this.keyPress);
            this.game.ws.continueToCharSelection = this.continueToCharSelection.bind(this);
        };
        EnterName.prototype.keyPress = function (char) {
            this.textInput.text = this.textInput.text + char;
        };
        EnterName.prototype.deleteLastLetter = function () {
            if (this.textInput.text.length > 0) {
                this.textInput.text = this.textInput.text.substring(0, this.textInput.text.length - 1);
            }
        };
        EnterName.prototype.submit = function () {
            if (!/^[0-9a-zA-Z]+$/.test(this.textInput.text)) {
                console.log("ivalid characters");
                return;
            }
            if (this.textInput.text != '') {
                this.game.ws.send({
                    type: Rwg.MessageType.NAME_SELECTION,
                    name: this.textInput.text
                });
            }
            else {
                console.log("name is empty");
            }
        };
        EnterName.prototype.continueToCharSelection = function (message) {
            if (message.nameAccepted) {
                this.game.input.keyboard.onPressCallback = null;
                this.game.state.start('CharSelection', true, false, {
                    name: this.textInput.text
                });
            }
            else {
                console.log(message.error);
            }
        };
        return EnterName;
    }(Phaser.State));
    Rwg.EnterName = EnterName;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    var Link = (function () {
        function Link() {
            this.base = {
                atlasName: 'link2',
                framesPerMovement: 6,
                movementSpeed: 300,
                scale: 2.0,
                dinamicMass: 20,
                staticMass: 150,
                health: {
                    maxHP: 50,
                    regenHPperSec: 0.08,
                    maxMP: 50,
                    regenMPperSec: 0.08
                },
                attacks: [
                    {
                        name: 'sword',
                        damage: 20,
                        range: 25,
                        attackSpeed: 300,
                        hitAreaWidth: 10,
                        hitAreaHeight: 70,
                        debug: false,
                        anim: {
                            framesNumber: 5,
                            prefix: 'sword'
                        }
                    },
                    {
                        name: 'bow',
                        spriteName: 'arrow',
                        damage: 8,
                        range: 600,
                        attackSpeed: 250,
                        hitAreaWidth: 35,
                        hitAreaHeight: 10,
                        cadence: 2,
                        bulletSpeed: 500,
                        debug: false,
                        anim: {
                            framesNumber: 5,
                            prefix: 'bow'
                        }
                    }
                ],
                skills: [
                    {
                        name: 'testTargetSkill',
                        anim: {
                            frames: ['standLeft.png', 'standUp.png', 'standRight.png', 'standDown.png', 'cast1.png', 'cast2.png', 'cast3.png']
                        },
                        castingSpeed: 1500,
                        effect: function (targets) { console.log(targets); }
                    },
                    {
                        name: 'testAreaSkill',
                        anim: {
                            frames: ['standLeft.png', 'standUp.png', 'standRight.png', 'standDown.png']
                        },
                        castingSpeed: '3000',
                        skillReadyIn: 0.5,
                        effect: function (targets) { console.log(targets); }
                    },
                    {
                        name: 'jump',
                        skillReadyIn: 0,
                        anim: {
                            frames: ['standLeft.png', 'standUp.png', 'standRight.png', 'standDown.png']
                        },
                        castingSpeed: 300,
                        effect: function (targets) {
                            this.game.physics.arcade.moveToXY(this, targets.x, targets.y, null, 300 - 20);
                            this.game.time.events.add(300 - 20, function () {
                                this.stopMovement();
                            }, this);
                        }
                    }
                ]
            };
            this.attackControls = [
                {
                    name: 'sword',
                    coolDown: 800,
                    activationKey: Phaser.KeyCode.ONE,
                    icon: 'sword.png'
                },
                {
                    name: 'bow',
                    coolDown: 300,
                    activationKey: Phaser.KeyCode.TWO,
                    icon: 'bow.png'
                }
            ];
            this.skillControls = [
                {
                    type: Rwg.SkillTypes.TARGET,
                    name: 'testTargetSkill',
                    range: 300,
                    coolDown: 2000,
                    activationKey: Phaser.KeyCode.THREE,
                    maxTargetsSelected: 2,
                    targetOnAlly: false,
                    icon: 'powerStrike.png'
                },
                {
                    type: Rwg.SkillTypes.AREA,
                    name: 'testAreaSkill',
                    range: 300,
                    coolDown: 6000,
                    activationKey: Phaser.KeyCode.FOUR,
                    icon: 'fireBall.png'
                },
                {
                    type: Rwg.SkillTypes.AREA,
                    name: 'jump',
                    range: 400,
                    coolDown: 600,
                    activationKey: Phaser.KeyCode.FIVE,
                    icon: 'agility.png'
                }
            ];
        }
        return Link;
    }());
    Rwg.Link = Link;
})(Rwg || (Rwg = {}));
/// <reference path="../characters/Link.ts" />
var Rwg;
(function (Rwg) {
    var CharacterSelecter = (function () {
        function CharacterSelecter() {
        }
        CharacterSelecter.getCharacterArgs = function (characterName) {
            switch (characterName) {
                case 'LINK':
                    return new Rwg.Link();
                    break;
                default:
                    return new Rwg.Link();
            }
        };
        CharacterSelecter.characterList = [
            { name: 'LINK', desc: "Link \nA stolen character I wanted to use" },
            { name: 'LINK', desc: "Link \nA stolen character I wanted to use" },
            { name: 'LINK', desc: "Link \nA stolen character I wanted to use" },
            { name: 'LINK', desc: "Link \nA stolen character I wanted to use" },
            { name: 'LINK', desc: "Link \nA stolen character I wanted to use" },
            { name: 'LINK', desc: "Link \nA stolen character I wanted to use" }
        ];
        return CharacterSelecter;
    }());
    Rwg.CharacterSelecter = CharacterSelecter;
})(Rwg || (Rwg = {}));
/// <reference path="../core/enums/MessageType.ts" />
/// <reference path="../characters/CharacterSelecter.ts" />
var Rwg;
(function (Rwg) {
    var CharSelection = (function (_super) {
        __extends(CharSelection, _super);
        function CharSelection() {
            _super.apply(this, arguments);
        }
        CharSelection.prototype.init = function (message) {
            this.playerName = message.name;
        };
        CharSelection.prototype.create = function () {
            var background = this.game.add.tileSprite(0, 0, 800, 600, 'background');
            background.fixedToCamera = true;
            this.slots = [];
            // description Container
            var descriptionContainer = this.game.add.group();
            descriptionContainer.fixedToCamera = true;
            descriptionContainer.scale.set(2);
            descriptionContainer.create(100 - 32, 200, 'uiAtlas', 'containerBorderRadiusBegin.png');
            var content = this.add.tileSprite(100, 200, 200, 64, 'uiAtlas', 'containerBorderRadius.png');
            descriptionContainer.add(content);
            descriptionContainer.create(100 + 200, 200, 'uiAtlas', 'containerBorderRadiusEnd.png');
            //description Text
            var description = this.game.add.group();
            description.fixedToCamera = true;
            var descriptionText = this.textLine(0, 0, Rwg.CharacterSelecter.characterList[0].desc, 12, content.width * 2);
            descriptionText.x = Math.floor(content.x + content.width / 2) * 2;
            descriptionText.y = Math.floor(content.y + content.height / 2) * 2;
            descriptionText.anchor.set(0.5);
            description.add(descriptionText);
            // character list
            var charList = this.game.add.group();
            charList.scale.set(2);
            // 
            var charListIcons = this.game.add.group();
            var y = 110;
            var x = 100;
            // first element
            var begin = charList.create(x, y, 'uiAtlas', 'charIconSlotBegin.png');
            charListIcons.create((x + 18) * 2, (y + 4) * 2, 'charIcons', Rwg.CharacterSelecter.characterList[0].name + ".png");
            x += 18 + 32 + 4;
            this.slots.push({ name: Rwg.CharacterSelecter.characterList[0], icon: begin });
            // middle elements
            for (var i = 1; i <= Rwg.CharacterSelecter.characterList.length - 2; i++) {
                this.slots.push({ name: Rwg.CharacterSelecter.characterList[i], icon: charList.create(x, y, 'uiAtlas', 'charIconSlot.png') });
                charListIcons.create((x + 8) * 2, (y + 4) * 2, 'charIcons', Rwg.CharacterSelecter.characterList[i].name + ".png");
                x += 8 + 32 + 4;
            }
            //last element
            var end = charList.create(x, y, 'uiAtlas', 'charIconSlotEnd.png');
            this.slots.push({ name: Rwg.CharacterSelecter.characterList[Rwg.CharacterSelecter.characterList.length - 1], icon: end });
            charListIcons.create((x + 8) * 2, (y + 4) * 2, 'charIcons', Rwg.CharacterSelecter.characterList[Rwg.CharacterSelecter.characterList.length - 1].name + ".png");
            // pointer
            this.pointer = charList.create(0, 0, 'uiAtlas', 'pointer.png');
            this.pointer.x = 100 + 18 + 8;
            this.pointer.y = y + 8 + 32;
            this.pointer.pos = 0;
            // movement cursor left
            var left = this.game.input.keyboard.addKey(Phaser.KeyCode.A);
            left.onDown.add(function () {
                if (this.pointer.pos != 0) {
                    this.pointer.pos--;
                    var x_1 = 8 + 8;
                    if (this.pointer.pos == 0) {
                        x_1 = 18 + 8;
                    }
                    this.pointer.x = this.slots[this.pointer.pos].icon.x + x_1;
                    descriptionText.text = Rwg.CharacterSelecter.characterList[this.pointer.pos].desc;
                }
            }, this);
            // right
            var right = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
            right.onDown.add(function () {
                if (this.pointer.pos != Rwg.CharacterSelecter.characterList.length - 1) {
                    this.pointer.pos++;
                    this.pointer.x = this.slots[this.pointer.pos].icon.x + 8 + 8;
                    descriptionText.text = Rwg.CharacterSelecter.characterList[this.pointer.pos].desc;
                }
            }, this);
            // resize the world
            var width = this.slots[Rwg.CharacterSelecter.characterList.length - 1].icon.x + 58 + 100;
            this.game.world.setBounds(0, 0, width * 2, 600);
            this.game.camera.follow(this.pointer);
            // instructions
            var instructions = this.game.add.group();
            instructions.fixedToCamera = true;
            instructions.scale.set(2);
            // instruction container
            instructions.create(100 - 32, 40 - 22, 'uiAtlas', 'containerBorderRadiusBegin.png');
            var content = this.add.tileSprite(100, 40 - 22, 200, 64, 'uiAtlas', 'containerBorderRadius.png');
            instructions.add(content);
            instructions.create(100 + 200, 40 - 22, 'uiAtlas', 'containerBorderRadiusEnd.png');
            var text = this.textLine(0, 0, 'SELECT', 20, content.width);
            text.x = Math.floor(content.x + content.width / 2) * 2;
            text.y = Math.floor(content.y - 10 + content.height / 2) * 2;
            text.anchor.set(0.5);
            text.fixedToCamera = true;
            var text = this.textLine(0, 0, 'Choose (ENTER)', 14, content.width);
            text.x = Math.floor(content.x + content.width / 2) * 2;
            text.y = Math.floor(content.y + 15 + content.height / 2) * 2;
            text.anchor.set(0.5);
            text.fixedToCamera = true;
            instructions.create(100, 45, 'uiAtlas', 'arrowLeft.png');
            instructions.add(this.textLine(100 + 11 + 5, 40, 'A'));
            instructions.create(300 - 11, 45, 'uiAtlas', 'arrowRight.png');
            instructions.add(this.textLine(300 - 11 - 11 - 5, 40, 'D'));
            // submit button
            this.game.input.keyboard.removeKeyCapture(13);
            var submit = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            submit.onDown.add(function () {
                var message = {
                    type: Rwg.MessageType.CHARACTER_SELECTION,
                    character: Rwg.CharacterSelecter.characterList[this.pointer.pos].name
                };
                this.game.ws.send(message);
            }, this);
            this.game.ws.continueToArenaSelection = this.continueToArenaSelection.bind(this);
        };
        CharSelection.prototype.textLine = function (x, y, text, size, wordWrapWidth) {
            var font = 12;
            if (size) {
                font = size;
            }
            var text = this.game.add.text(x, y, text, { font: font + "px Arial", fill: "#ffffff",
                wordWrap: true, wordWrapWidth: wordWrapWidth, align: "center" });
            text.stroke = '#000000';
            text.strokeThickness = 2;
            return text;
        };
        CharSelection.prototype.continueToArenaSelection = function (message) {
            this.game.state.start('ArenaSelection', true, false, {
                name: this.playerName,
                character: Rwg.CharacterSelecter.characterList[this.pointer.pos].name
            });
        };
        return CharSelection;
    }(Phaser.State));
    Rwg.CharSelection = CharSelection;
})(Rwg || (Rwg = {}));
/// <reference path="../characters/Link.ts" />
var Rwg;
(function (Rwg) {
    var ArenaSelecter = (function () {
        function ArenaSelecter() {
        }
        ArenaSelecter.arenaList = [
            { name: 'ForestTown', desc: "Forest Town \n1", icon: 'ForestTown.png' },
            { name: 'ForestTown', desc: "Forest Town \n2", icon: 'ForestTown.png' },
            { name: 'ForestTown', desc: "Forest Town \n3", icon: 'ForestTown.png' },
            { name: 'ForestTown', desc: "Forest Town \n4", icon: 'ForestTown.png' },
            { name: 'ForestTown', desc: "Forest Town \n5", icon: 'ForestTown.png' }
        ];
        return ArenaSelecter;
    }());
    Rwg.ArenaSelecter = ArenaSelecter;
})(Rwg || (Rwg = {}));
/// <reference path="../core/enums/MessageType.ts" />
/// <reference path="../arenas/ArenaSelecter.ts" />
var Rwg;
(function (Rwg) {
    var ArenaSelection = (function (_super) {
        __extends(ArenaSelection, _super);
        function ArenaSelection() {
            _super.apply(this, arguments);
        }
        ArenaSelection.prototype.init = function (message) {
            this.playerName = message.name;
            this.character = message.character;
        };
        ArenaSelection.prototype.create = function () {
            var background = this.game.add.tileSprite(0, 0, 800, 600, 'background');
            background.fixedToCamera = true;
            var teamselectorGroup = this.game.add.group();
            teamselectorGroup.fixToCamera = true;
            teamselectorGroup.scale.set(2);
            var xpos = 145;
            var ypos = 25;
            teamselectorGroup.create(xpos, ypos, 'uiAtlas', 'team_select_begin.png');
            var team1 = this.add.tileSprite(xpos + 32, ypos, 60, 24, 'uiAtlas', 'team_select.png');
            teamselectorGroup.add(team1);
            teamselectorGroup.create(xpos + 32 + 60, ypos, 'uiAtlas', 'team_select_end_2.png');
            var orbTeam1 = teamselectorGroup.create(xpos + 5, ypos + 5, 'uiAtlas', 'orb.png');
            this.textLine((xpos + 45) * 2, (ypos + 7) * 2, 'TEAM 0 (W)', 15, team1);
            ypos = 250;
            teamselectorGroup.create(xpos, ypos, 'uiAtlas', 'team_select_begin.png');
            var team2 = this.add.tileSprite(xpos + 32, ypos, 60, 24, 'uiAtlas', 'team_select.png');
            teamselectorGroup.add(team2);
            teamselectorGroup.create(xpos + 32 + 60, ypos, 'uiAtlas', 'team_select_end_2.png');
            var orbTeam2 = teamselectorGroup.create(xpos + 5, ypos + 5, 'uiAtlas', 'orb.png');
            this.textLine((xpos + 45) * 2, (ypos + 7) * 2, 'TEAM 1 (S)', 15, team1);
            // movement cursor UP
            var up = this.game.input.keyboard.addKey(Phaser.KeyCode.W);
            up.onDown.add(function () {
                orbTeam1.frameName = 'red_orb.png';
                orbTeam2.frameName = 'orb.png';
                this.selectedTeam = 0;
            }, this);
            // Down
            var down = this.game.input.keyboard.addKey(Phaser.KeyCode.S);
            down.onDown.add(function () {
                orbTeam2.frameName = 'red_orb.png';
                orbTeam1.frameName = 'orb.png';
                this.selectedTeam = 1;
            }, this);
            this.addArenaContainer(Rwg.ArenaSelecter.arenaList[0], xpos + 25, 80);
            var index = 0;
            // movement cursor left
            var left = this.game.input.keyboard.addKey(Phaser.KeyCode.A);
            left.onDown.add(function () {
                if (index > 0) {
                    index--;
                    this.icon = Rwg.ArenaSelecter.arenaList[index].icon;
                    this.description.text = Rwg.ArenaSelecter.arenaList[index].desc;
                    this.selectedArena = Rwg.ArenaSelecter.arenaList[index].name;
                }
            }, this);
            // right
            var right = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
            right.onDown.add(function () {
                if (index < Rwg.ArenaSelecter.arenaList.length) {
                    index++;
                    this.icon = Rwg.ArenaSelecter.arenaList[index].icon;
                    this.description.text = Rwg.ArenaSelecter.arenaList[index].desc;
                    this.selectedArena = Rwg.ArenaSelecter.arenaList[index].name;
                }
            }, this);
            this.selectedTeam = null;
            this.selectedArena = Rwg.ArenaSelecter.arenaList[0].name;
            // submit button
            this.game.input.keyboard.removeKeyCapture(13);
            var submit = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            submit.onDown.add(function () {
                if (this.selectedTeam != null) {
                    var message = {
                        type: Rwg.MessageType.ARENA_SELECTION,
                        arena: this.selectedArena,
                        team: this.selectedTeam
                    };
                    this.game.ws.send(message);
                }
            }, this);
            this.game.ws.initArena = this.initArena.bind(this);
        };
        ArenaSelection.prototype.initArena = function (message) {
            this.game.state.start(this.selectedArena, true, false, {
                name: this.playerName,
                character: this.character,
                team: this.selectedTeam,
                playerScores: message.playerScores
            });
        };
        ArenaSelection.prototype.addArenaContainer = function (element, x, y) {
            this.icon = this.game.add.sprite((x) * 2, (y) * 2, 'arenaIcons', element.icon);
            var container = this.game.add.group();
            container.scale.set(2);
            container.create(x, y, 'uiAtlas', 'frame_top_left.png');
            container.create(x + 32, y, 'uiAtlas', 'frame_top_right.png');
            container.create(x, y + 32, 'uiAtlas', 'frame_bottom_left.png');
            container.create(x + 32, y + 32, 'uiAtlas', 'frame_bottom_right.png');
            // description Container
            var descriptionContainer = this.game.add.group();
            descriptionContainer.fixedToCamera = true;
            descriptionContainer.scale.set(2);
            descriptionContainer.create(x - 50, y + 80, 'uiAtlas', 'containerBorderRadiusBegin.png');
            var content = this.add.tileSprite(x + 32 - 50, y + 80, 100, 64, 'uiAtlas', 'containerBorderRadius.png');
            descriptionContainer.add(content);
            descriptionContainer.create(x + 32 + 100 - 50, y + 80, 'uiAtlas', 'containerBorderRadiusEnd.png');
            this.description = this.textLine((x - 50 + 32 + 25) * 2, (y + 80 + 14) * 2, element.desc, 15, content);
        };
        ArenaSelection.prototype.textLine = function (x, y, text, size, wordWrapWidth) {
            var font = 12;
            if (size) {
                font = size;
            }
            var text = this.game.add.text(x, y, text, { font: font + "px Arial", fill: "#ffffff",
                wordWrap: true, wordWrapWidth: wordWrapWidth, align: "center" });
            text.stroke = '#000000';
            text.strokeThickness = 2;
            return text;
        };
        return ArenaSelection;
    }(Phaser.State));
    Rwg.ArenaSelection = ArenaSelection;
})(Rwg || (Rwg = {}));
/// <reference path="../core/enums/MessageType.ts" />
/// <reference path="../characters/CharacterSelecter.ts" />
var Rwg;
(function (Rwg) {
    var GameOver = (function (_super) {
        __extends(GameOver, _super);
        function GameOver() {
            _super.apply(this, arguments);
        }
        GameOver.prototype.init = function (gameover) {
            this.arena = gameover.arena;
            this.player = gameover.player;
            this.leaderBoard = gameover.leaderBoard;
            this.winner = gameover.winner;
        };
        GameOver.prototype.create = function () {
            var y = 10;
            for (var i = 0; i < this.leaderBoard.length; i++) {
                var score = this.leaderBoard[i].kill + " / " + this.leaderBoard[i].assist + " / " + this.leaderBoard[i].death;
                this.addContainer(y, score, this.leaderBoard[i].character + ".jpg");
                y += 70;
            }
            this.game.world.setBounds(0, 0, 800, (y + 10) * 2);
            // movement cursor up
            var up = this.game.input.keyboard.addKey(Phaser.KeyCode.W);
            up.onHoldCallback = function () {
                this.game.camera.y -= 4;
            }.bind(this);
            // down
            var down = this.game.input.keyboard.addKey(Phaser.KeyCode.S);
            down.onHoldCallback = function () {
                this.game.camera.y += 4;
            }.bind(this);
            // submit button
            this.game.input.keyboard.removeKeyCapture(13);
            var submit = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            submit.onDown.add(function () {
                this.game.input.keyboard.onPressCallback = null;
                this.game.state.start('CharSelection', true, false, {
                    name: this.player.name
                });
            }, this);
        };
        GameOver.prototype.addContainer = function (y, score, icon) {
            var container = this.game.add.group();
            container.scale.set(2);
            container.create(100 - 32, y, 'uiAtlas', 'containerBorderRadiusBegin.png');
            var content = this.add.tileSprite(100, y, 200, 64, 'uiAtlas', 'containerBorderRadius.png');
            container.add(content);
            container.create(100 + 200, y, 'uiAtlas', 'containerBorderRadiusEnd.png');
            var icon = this.game.add.sprite((100 + 5) * 2, (y + 15) * 2, 'charIcons', icon);
            description;
            Text;
            var description = this.game.add.group();
            var descriptionText = this.textLine(0, 0, score, 16, content.width * 2);
            descriptionText.x = Math.floor(content.x + content.width / 2) * 2;
            descriptionText.y = Math.floor(content.y + content.height / 2) * 2;
            descriptionText.anchor.set(0.5);
            description.add(descriptionText);
        };
        GameOver.prototype.textLine = function (x, y, text, size, wordWrapWidth) {
            var font = 12;
            if (size) {
                font = size;
            }
            var text = this.game.add.text(x, y, text, { font: font + "px Arial", fill: "#ffffff",
                wordWrap: true, wordWrapWidth: wordWrapWidth, align: "center" });
            text.stroke = '#000000';
            text.strokeThickness = 2;
            return text;
        };
        return GameOver;
    }(Phaser.State));
    Rwg.GameOver = GameOver;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    (function (FacingPositions) {
        FacingPositions[FacingPositions["LEFT"] = 1] = "LEFT";
        FacingPositions[FacingPositions["RIGHT"] = 2] = "RIGHT";
        FacingPositions[FacingPositions["UP"] = 3] = "UP";
        FacingPositions[FacingPositions["DOWN"] = 4] = "DOWN";
    })(Rwg.FacingPositions || (Rwg.FacingPositions = {}));
    var FacingPositions = Rwg.FacingPositions;
    ;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    (function (CollisionCategory) {
        CollisionCategory[CollisionCategory["WALL"] = parseInt('000010', 2)] = "WALL";
        CollisionCategory[CollisionCategory["TEAM_ONE_HITBOX"] = parseInt('001000', 2)] = "TEAM_ONE_HITBOX";
        CollisionCategory[CollisionCategory["TEAM_ZERO_HITBOX"] = parseInt('000100', 2)] = "TEAM_ZERO_HITBOX";
        CollisionCategory[CollisionCategory["ATTACK"] = parseInt('010000', 2)] = "ATTACK";
        CollisionCategory[CollisionCategory["CHAR_BODY"] = parseInt('100000', 2)] = "CHAR_BODY";
    })(Rwg.CollisionCategory || (Rwg.CollisionCategory = {}));
    var CollisionCategory = Rwg.CollisionCategory;
    ;
})(Rwg || (Rwg = {}));
/// <reference path="../enums/FacingPositions.ts" />
/// <reference path="../enums/CollisionCategory.ts" />
var Rwg;
(function (Rwg) {
    var BaseChar = (function (_super) {
        __extends(BaseChar, _super);
        /* Sprite properties
        *
        *  name: character identification
        *
        */
        function BaseChar(game, name, atlasName, framesPerMovement, scale) {
            _super.call(this, game, 80, 80, atlasName);
            this.name = name;
            this.frameName = 'standDown.png';
            this.anchor.setTo(0.5, 0.5);
            this.game.add.existing(this);
            this.updateMethods = {};
            //enable physics
            this.game.physics.box2d.enable(this);
            this.body.clearFixtures();
            if (scale) {
                this.scale.setTo(scale);
            }
            // the body fixture to handle collisions with elements
            this.collisionHitbox = this.body.addRectangle(Math.floor(this.width / 2), Math.floor(this.height / 2), 0, Math.floor(this.height / 4));
            this.collisionHitbox.m_filter.maskBits = Rwg.CollisionCategory.WALL | Rwg.CollisionCategory.CHAR_BODY;
            this.collisionHitbox.m_filter.categoryBits = Rwg.CollisionCategory.CHAR_BODY;
            this.damageHitbox = this.body.addRectangle(this.width, this.height, 0, 0);
            this.body.fixedRotation = true;
            this.body.linearDamping = 10;
            //Movement Settings
            this.holdSpeed = false;
            this.maxSpeed = 0;
            this.directionX = 0;
            this.directionY = 0;
            // speed update method
            this.updateMethods['speedUpdateMethod'] = function () {
                if (this.holdSpeed) {
                    this.body.mass = this.dinamicMass;
                    if (Math.abs(this.body.velocity.x) < this.maxSpeed) {
                        this.body.velocity.x = this.body.velocity.x + (100 * this.directionX);
                    }
                    else {
                        this.body.velocity.x = this.maxSpeed * this.directionX;
                    }
                    if (Math.abs(this.body.velocity.y) < this.maxSpeed) {
                        this.body.velocity.y = this.body.velocity.y + (100 * this.directionY);
                    }
                    else {
                        this.body.velocity.y = this.maxSpeed * this.directionY;
                    }
                }
                else {
                    this.body.mass = this.staticMass;
                }
            }.bind(this);
            // movement animations
            var moveRightFrames = [];
            var moveLeftFrames = [];
            var moveUpFrames = [];
            var moveDownFrames = [];
            for (var i = 1; i <= framesPerMovement; i++) {
                moveRightFrames.push('moveRight' + i + '.png');
                moveLeftFrames.push('moveLeft' + i + '.png');
                moveUpFrames.push('moveUp' + i + '.png');
                moveDownFrames.push('moveDown' + i + '.png');
            }
            var moveRight = this.animations.add('moveRight', moveRightFrames, 16, true);
            var moveLeft = this.animations.add('moveLeft', moveLeftFrames, 16, true);
            var moveUp = this.animations.add('moveUp', moveUpFrames, 16, true);
            var moveDown = this.animations.add('moveDown', moveDownFrames, 16, true);
            // holds who hitted this player
            this.hittedStack = [];
            // Health Settings
            this.maxHP = 1;
            this.currentHP = 1;
            this.regenHPperSec = 0.1;
            this.maxMP = 1;
            this.currentMP = 1;
            this.regenMPperSec = 0.1;
            this.healthRestorationTime = 0;
            this.updateMethods['healthRestorationTime'] = function () {
                if (this.maxHP == this.currentHP && this.maxMP == this.currentMP) {
                    return;
                }
                if (this.game.time.now > this.healthRestorationTime) {
                    if ((this.currentHP + (this.maxHP * this.regenHPperSec)) > this.maxHP) {
                        this.currentHP = this.maxHP;
                    }
                    else {
                        this.currentHP = this.currentHP + (this.maxHP * this.regenHPperSec);
                    }
                    if ((this.currentMP + (this.maxMP * this.regenMPperSec)) > this.maxMP) {
                        this.currentMP = this.maxMP;
                    }
                    else {
                        this.currentMP = this.currentMP + (this.maxMP * this.regenMPperSec);
                    }
                    this.healthRestorationTime = this.game.time.now + 1000;
                }
            }.bind(this);
            this.updateMethods['checkKilled'] = function () {
                if (this.killed) {
                    this.moveCharacterToXY(this.respawn.x, this.respawn.y);
                    this.killed = false;
                }
            }.bind(this);
        }
        BaseChar.prototype.update = function () {
            for (var key in this.updateMethods) {
                this.updateMethods[key]();
            }
        };
        /*
         *  MOVEMENT METHODS
         */
        BaseChar.prototype.moveCharacterToXY = function (x, y) {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.speedX = 0;
            this.speedY = 0;
            this.body.x = x;
            this.body.y = y;
            this.stopMovementAnimation();
            this.holdSpeed = false;
        };
        BaseChar.prototype.setVelocity = function (x, y, velocityBitMask) {
            this.body.x = x;
            this.body.y = y;
            // set the max velocity
            this.maxSpeed = this.movementSpeed;
            var stringBitMask = velocityBitMask.toString(2);
            if ((stringBitMask.split('1').length - 1) == 2) {
                this.maxSpeed *= Math.sin(Math.PI / 4);
            }
            // bitmask array manipulation
            var bitMaskArray = stringBitMask.split('').reverse();
            var bitMaskIntArray = [];
            for (var i = 0; i < bitMaskArray.length; i++) {
                bitMaskIntArray.push(parseInt(bitMaskArray[i]));
            }
            // set the directions from the bitmask array
            this.directionX = 0;
            this.directionY = 0;
            if (bitMaskIntArray[0]) {
                this.directionX = -1;
            }
            if (bitMaskIntArray[1]) {
                this.directionX = 1;
            }
            if (bitMaskIntArray[2]) {
                this.directionY = -1;
            }
            if (bitMaskIntArray[3]) {
                this.directionY = 1;
            }
            this.body.velocity.x = this.maxSpeed * this.directionX;
            this.body.velocity.y = this.maxSpeed * this.directionY;
            this.startMoveAnimationBaseOnVelocity();
            this.holdSpeed = true;
        };
        BaseChar.prototype.stopMovement = function () {
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
        };
        /*
         *  DAMAGE
         */
        BaseChar.prototype.damage = function (message) {
            this.killed = message.killed;
            this.currentHP = message.currentHP;
        };
        /*
         *  SPRITE ANIMATION METHODS
         */
        BaseChar.prototype.startMoveAnimationBaseOnVelocity = function () {
            switch (this.getFacingBaseOnVelocity()) {
                case Rwg.FacingPositions.RIGHT:
                    this.play('moveRight');
                    break;
                case Rwg.FacingPositions.LEFT:
                    this.play('moveLeft');
                    break;
                case Rwg.FacingPositions.UP:
                    this.play('moveUp');
                    break;
                case Rwg.FacingPositions.DOWN:
                    this.play('moveDown');
            }
        };
        BaseChar.prototype.stopMovementAnimation = function () {
            this.animations.stop('moveRight', this.frame);
            this.animations.stop('moveLeft', this.frame);
            this.animations.stop('moveUp', this.frame);
            this.animations.stop('moveDown', this.frame);
            this.changeFacingBaseOnFrame();
        };
        /*
         *  UTIL METHODS
         */
        BaseChar.prototype.getFacingBaseOnVelocity = function () {
            if (this.body.velocity.x > 0) {
                return Rwg.FacingPositions.RIGHT;
            }
            else if (this.body.velocity.x < 0) {
                return Rwg.FacingPositions.LEFT;
            }
            else if (this.body.velocity.y > 0) {
                return Rwg.FacingPositions.DOWN;
            }
            else if (this.body.velocity.y < 0) {
                return Rwg.FacingPositions.UP;
            }
        };
        BaseChar.prototype.getFacingBaseOnPoint = function (x, y) {
            var horizontalDiff = x - this.x;
            var verticalDiff = y - this.y;
            if (horizontalDiff > 0 && Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
                return Rwg.FacingPositions.RIGHT;
            }
            else if (horizontalDiff < 0 && Math.abs(horizontalDiff) > Math.abs(verticalDiff)) {
                return Rwg.FacingPositions.LEFT;
            }
            else if (verticalDiff > 0 && Math.abs(horizontalDiff) < Math.abs(verticalDiff)) {
                return Rwg.FacingPositions.DOWN;
            }
            else if (verticalDiff < 0 && Math.abs(horizontalDiff) < Math.abs(verticalDiff)) {
                return Rwg.FacingPositions.UP;
            }
            else if (horizontalDiff > 0 && Math.abs(horizontalDiff) == Math.abs(verticalDiff)) {
                return Rwg.FacingPositions.RIGHT;
            }
            else if (horizontalDiff < 0 && Math.abs(horizontalDiff) == Math.abs(verticalDiff)) {
                return Rwg.FacingPositions.LEFT;
            }
        };
        BaseChar.prototype.changeFacingBaseOnFrame = function () {
            if (/Right/.test(this.frameName)) {
                this.frameName = 'standRight.png';
                return;
            }
            if (/Left/.test(this.frameName)) {
                this.frameName = 'standLeft.png';
                return;
            }
            if (/Up/.test(this.frameName)) {
                this.frameName = 'standUp.png';
                return;
            }
            // default
            this.frameName = 'standDown.png';
        };
        BaseChar.prototype.getAheadPointBaseOnCurrentFrame = function () {
            if (/Right/.test(this.frameName)) {
                return new Phaser.Point(this.x + 10, this.y);
            }
            if (/Left/.test(this.frameName)) {
                return new Phaser.Point(this.x - 10, this.y);
            }
            if (/Up/.test(this.frameName)) {
                return new Phaser.Point(this.x, this.y - 10);
            }
            // default
            return new Phaser.Point(this.x, this.y + 10);
        };
        return BaseChar;
    }(Phaser.Sprite));
    Rwg.BaseChar = BaseChar;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    (function (SkillTypes) {
        SkillTypes[SkillTypes["TARGET"] = 0] = "TARGET";
        SkillTypes[SkillTypes["AREA"] = 1] = "AREA";
        SkillTypes[SkillTypes["SELF"] = 2] = "SELF";
    })(Rwg.SkillTypes || (Rwg.SkillTypes = {}));
    var SkillTypes = Rwg.SkillTypes;
    ;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    (function (MovementVectorsBitMask) {
        MovementVectorsBitMask[MovementVectorsBitMask["NOT_DEF_1"] = parseInt('0011', 2)] = "NOT_DEF_1";
        MovementVectorsBitMask[MovementVectorsBitMask["NOT_DEF_2"] = parseInt('1100', 2)] = "NOT_DEF_2";
    })(Rwg.MovementVectorsBitMask || (Rwg.MovementVectorsBitMask = {}));
    var MovementVectorsBitMask = Rwg.MovementVectorsBitMask;
    ;
    (function (KeysBitMask) {
        KeysBitMask[KeysBitMask["A"] = parseInt('0001', 2)] = "A";
        KeysBitMask[KeysBitMask["D"] = parseInt('0010', 2)] = "D";
        KeysBitMask[KeysBitMask["W"] = parseInt('0100', 2)] = "W";
        KeysBitMask[KeysBitMask["S"] = parseInt('1000', 2)] = "S";
    })(Rwg.KeysBitMask || (Rwg.KeysBitMask = {}));
    var KeysBitMask = Rwg.KeysBitMask;
    ;
})(Rwg || (Rwg = {}));
/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enums/MessageType.ts" />
/// <reference path="../enums/ MovementVectors.ts" />
var Rwg;
(function (Rwg) {
    var MovementControlProvider = (function () {
        function MovementControlProvider() {
        }
        MovementControlProvider.prototype.provide = function (character) {
            character.movementControlEnable = true;
            character.movementControlEnableBefore = true;
            character.initCharMovementControls = this.initCharMovementControls.bind(character);
            character.movementKeysOnDown = this.movementKeysOnDown.bind(character);
            character.movementKeysOnUp = this.movementKeysOnUp.bind(character);
            character.setVelocityForKey = this.setVelocityForKey.bind(character);
            character.sendUpdateCharPosition = this.sendUpdateCharPosition.bind(character);
            character.sendUpdateCharVelocity = this.sendUpdateCharVelocity.bind(character);
            character.initCharMovementControls();
            // add listener for the change in movementControlEnable
            character.updateMethods['movementControlEnableListener'] = function () {
                if (this.movementControlEnableBefore != character.movementControlEnable) {
                    this.movementControlEnableBefore = character.movementControlEnable;
                    if (character.movementControlEnable) {
                        if (this.keyStack.length != 0) {
                            this.setVelocityForKey(this.keyStack[this.keyStack.length - 1]);
                        }
                    }
                }
            }.bind(character);
        };
        MovementControlProvider.prototype.initCharMovementControls = function () {
            // this is not an stack at all since we are removing randomly, but the idea is to 
            // maintain the input order
            this.keyStack = new Array();
            this.movementKeys = [Phaser.KeyCode.A, Phaser.KeyCode.D, Phaser.KeyCode.W, Phaser.KeyCode.S];
            this.game.input.keyboard.addCallbacks(this, this.movementKeysOnDown, this.movementKeysOnUp, null);
        };
        MovementControlProvider.prototype.movementKeysOnDown = function (event) {
            var keyCode = event.keyCode;
            if (this.movementKeys.indexOf(keyCode) != -1 && this.keyStack.indexOf(keyCode) == -1) {
                this.keyStack.push(event.keyCode);
                this.setVelocityForKey(event.keyCode);
            }
        };
        MovementControlProvider.prototype.movementKeysOnUp = function (event) {
            var keyCode = event.keyCode;
            if (this.movementKeys.indexOf(keyCode) != -1) {
                this.keyStack.splice(this.keyStack.indexOf(event.keyCode), 1);
                if (this.keyStack.length == 0 && this.movementControlEnable) {
                    this.sendUpdateCharPosition();
                }
                else {
                    // tops the last input
                    this.setVelocityForKey(this.keyStack[this.keyStack.length - 1]);
                }
            }
        };
        MovementControlProvider.prototype.setVelocityForKey = function (keyCode) {
            // the keyStack continues doing the stacking, but the movement is not performed
            if (!this.movementControlEnable) {
                return;
            }
            var lastKeyPressBitMask = null;
            switch (keyCode) {
                case Phaser.KeyCode.A:
                    lastKeyPressBitMask = Rwg.KeysBitMask.A;
                    break;
                case Phaser.KeyCode.D:
                    lastKeyPressBitMask = Rwg.KeysBitMask.D;
                    break;
                case Phaser.KeyCode.W:
                    lastKeyPressBitMask = Rwg.KeysBitMask.W;
                    break;
                case Phaser.KeyCode.S:
                    lastKeyPressBitMask = Rwg.KeysBitMask.S;
                    break;
            }
            var movementVectorsBitMask = lastKeyPressBitMask;
            // if there is another key pressed
            if (this.keyStack.length > 1) {
                var secondToLastPressKeyBitMask = null;
                switch (this.keyStack[this.keyStack.length - 2]) {
                    case Phaser.KeyCode.A:
                        secondToLastPressKeyBitMask = Rwg.KeysBitMask.A;
                        break;
                    case Phaser.KeyCode.D:
                        secondToLastPressKeyBitMask = Rwg.KeysBitMask.D;
                        break;
                    case Phaser.KeyCode.W:
                        secondToLastPressKeyBitMask = Rwg.KeysBitMask.W;
                        break;
                    case Phaser.KeyCode.S:
                        secondToLastPressKeyBitMask = Rwg.KeysBitMask.S;
                        break;
                }
                var result = lastKeyPressBitMask | secondToLastPressKeyBitMask;
                if (result != Rwg.MovementVectorsBitMask.NOT_DEF_1 && result != Rwg.MovementVectorsBitMask.NOT_DEF_2) {
                    movementVectorsBitMask = result;
                }
            }
            this.sendUpdateCharVelocity(movementVectorsBitMask);
        };
        MovementControlProvider.prototype.sendUpdateCharPosition = function () {
            this.game.ws.send({
                name: this.name,
                x: Math.floor(this.x),
                y: Math.floor(this.y),
                type: Rwg.MessageType.MOVE
            });
            this.moveCharacterToXY(this.x, this.y);
        };
        MovementControlProvider.prototype.sendUpdateCharVelocity = function (velocityBitMask) {
            this.game.ws.send({
                name: this.name,
                x: Math.floor(this.x),
                y: Math.floor(this.y),
                velocityBitMask: velocityBitMask,
                type: Rwg.MessageType.VELOCITY
            });
            this.setVelocity(this.x, this.y, velocityBitMask);
        };
        return MovementControlProvider;
    }());
    Rwg.MovementControlProvider = MovementControlProvider;
})(Rwg || (Rwg = {}));
/// <reference path="../base/BaseChar.ts" />
/// <reference path="../enums/FacingPositions.ts" />
var Rwg;
(function (Rwg) {
    var CharAnimFactory = (function () {
        function CharAnimFactory(args) {
            this.prefix = args.prefix;
            this.frames = args.frames;
            this.framesNumber = args.framesNumber;
            this.upFrames = [];
            this.downFrames = [];
            this.leftFrames = [];
            this.rightFrames = [];
        }
        CharAnimFactory.prototype.getPlayAnimationTowardsMethod = function (animId, character, attackSpeed) {
            if (this.prefix) {
                return this.getMultipleAnimationMethod(animId, character, attackSpeed);
            }
            else {
                return this.getSinlgeAnimationMethod(animId, character, attackSpeed);
            }
        };
        CharAnimFactory.prototype.getSinlgeAnimationMethod = function (animId, character, attackSpeed) {
            this.createAnimation(character, attackSpeed, this.frames, animId);
            return function (x, y) {
                this.play(animId);
            };
        };
        CharAnimFactory.prototype.getMultipleAnimationMethod = function (animId, character, attackSpeed) {
            for (var i = 0; i < this.framesNumber; i++) {
                this.upFrames.push(this.prefix + 'Up' + (i + 1) + '.png');
                this.downFrames.push(this.prefix + 'Down' + (i + 1) + '.png');
                this.leftFrames.push(this.prefix + 'Left' + (i + 1) + '.png');
                this.rightFrames.push(this.prefix + 'Right' + (i + 1) + '.png');
            }
            this.createAnimation(character, attackSpeed, this.upFrames, animId + 'UpCharAnim');
            this.createAnimation(character, attackSpeed, this.downFrames, animId + 'DownCharAnim');
            this.createAnimation(character, attackSpeed, this.leftFrames, animId + 'LeftCharAnim');
            this.createAnimation(character, attackSpeed, this.rightFrames, animId + 'RightCharAnim');
            return function (x, y) {
                switch (this.getFacingBaseOnPoint(x, y)) {
                    case Rwg.FacingPositions.RIGHT:
                        this.play(animId + 'RightCharAnim');
                        break;
                    case Rwg.FacingPositions.LEFT:
                        this.play(animId + 'LeftCharAnim');
                        break;
                    case Rwg.FacingPositions.UP:
                        this.play(animId + 'UpCharAnim');
                        break;
                    case Rwg.FacingPositions.DOWN:
                        this.play(animId + 'DownCharAnim');
                }
            };
        };
        CharAnimFactory.prototype.createAnimation = function (character, attackSpeed, animFrames, subAnimId) {
            var fps = Math.floor(animFrames.length / (attackSpeed / 1000));
            var anim = character.animations.add(subAnimId, animFrames, fps, false);
            anim.onComplete.add(function () { this.changeFacingBaseOnFrame(); }, character);
        };
        return CharAnimFactory;
    }());
    Rwg.CharAnimFactory = CharAnimFactory;
})(Rwg || (Rwg = {}));
/// <reference path="../factories/CharAnimFactory.ts" />
/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enums/CollisionCategory.ts" />
var Rwg;
(function (Rwg) {
    var AttackProvider = (function () {
        function AttackProvider(args) {
            this.name = args.name;
            this.damage = args.damage;
            this.range = args.range;
            this.attackSpeed = args.attackSpeed;
            this.hitAreaWidth = args.hitAreaWidth;
            this.hitAreaHeight = args.hitAreaHeight;
            this.debug = args.debug;
            this.anim = args.anim;
            this.spriteName = args.spriteName;
            this.bulletSpeed = args.bulletSpeed;
            this.cadence = args.cadence;
        }
        AttackProvider.prototype.provide = function (game, character) {
            // create a new attack in the attack list
            character.attacks[this.name] = {};
            character.attacks[this.name].damage = this.damage;
            character.attacks[this.name].attackSpeed = this.attackSpeed;
            character.attacks[this.name].range = this.range;
            character.attacks[this.name].hitAreaWidth = this.hitAreaWidth;
            character.attacks[this.name].hitAreaHeight = this.hitAreaHeight;
            character.attacks[this.name].spriteName = this.spriteName;
            character.attacks[this.name].bulletSpeed = this.bulletSpeed;
            character.attacks[this.name].name = this.name;
            // if cadence defined
            character.attacks[this.name].cadence = 1;
            if (this.cadence) {
                character.attacks[this.name].cadence = this.cadence;
            }
            character.attacks[this.name].created = game.add.group();
            // this is an empty method to store an additional trigger behaviour like the skill icon or the casting bar
            character.attacks[this.name].additionalOnTriggerCallBack = function () { };
            // method to create a new sprite hit area every time the hit is triggered
            character.attacks[this.name].createNewHitArea = this.getCreateSpriteHitAreaMethod(this.name).bind(character);
            // generates the method callbacks for the attack
            character.attacks[this.name].attack = this.getAttackMethod(this.name).bind(character);
            // the method to check the range of the hit area
            character.updateMethods['checkRangeFor' + this.name] =
                this.getCheckRangeForAttackMethod(this.name).bind(character);
            // creates the animation method for this attack
            var animationFactory = new Rwg.CharAnimFactory(this.anim);
            character.attacks[this.name].playAttackAnimationTowards =
                animationFactory.getPlayAnimationTowardsMethod(this.name, character, this.attackSpeed).bind(character);
            // debug the hit area
            var name = this.name;
            if (this.debug) {
                game.renderMethods['debug-' + this.name + character.name] = function () {
                    this.attacks[name].created.forEach(function (member) {
                        if (member) {
                            this.game.debug.body(member);
                        }
                    }, this, true);
                }.bind(character);
            }
        };
        AttackProvider.prototype.getAttackMethod = function (attackName) {
            return function (message) {
                var target = new Phaser.Point(message.targetX, message.targetY);
                var position = new Phaser.Point(message.x, message.y);
                // fix the character position and stop movement
                this.moveCharacterToXY(position.x, position.y);
                // creates a new hit area
                var hitAreaSprite = this.attacks[attackName].createNewHitArea(position, target);
                //start the animation
                if (this.attacks[attackName].playAttackAnimationTowards != null) {
                    this.attacks[attackName].playAttackAnimationTowards(target.x, target.y);
                }
                // the hitArea movement speed will be the distance in pixeles divided by the attackspeed in miliseconds
                // I want to change this to have the hitArea speed calculated different, but base on attackSpeed
                var speed = this.attacks[attackName].range / (this.attacks[attackName].attackSpeed / 1000);
                this.attacks[attackName].additionalOnTriggerCallBack();
                // if it is a bullet the speed will be the bullet speed
                if (this.attacks[attackName].bulletSpeed) {
                    speed = this.attacks[attackName].bulletSpeed;
                }
                this.game.physics.arcade.moveToXY(hitAreaSprite, target.x, target.y, speed);
            };
        };
        AttackProvider.prototype.getCreateSpriteHitAreaMethod = function (attackName) {
            return function (position, target) {
                // generate the attack hit area sprite
                var hitAreaSprite = this.attacks[attackName].created.create(0, 0, this.attacks[attackName].spriteName);
                hitAreaSprite.exists = false;
                hitAreaSprite.visible = false;
                hitAreaSprite.origin = {};
                hitAreaSprite.attackName = attackName;
                // creates the box2D physics
                this.game.physics.box2d.enable(hitAreaSprite);
                hitAreaSprite.body.fixedRotation = true;
                hitAreaSprite.body.clearFixtures();
                hitAreaSprite.reset(position.x, position.y);
                hitAreaSprite.body.setRectangle(this.attacks[attackName].hitAreaWidth, this.attacks[attackName].hitAreaHeight);
                hitAreaSprite.body.rotation = this.game.physics.arcade.angleBetween(position, target);
                hitAreaSprite.origin.x = position.x;
                hitAreaSprite.origin.y = position.y;
                hitAreaSprite.body.collideWorldBounds = false;
                hitAreaSprite.body.setCollisionCategory(Rwg.CollisionCategory.ATTACK);
                hitAreaSprite.body.setCollisionMask(this.attackMask);
                hitAreaSprite.body.sensor = true;
                hitAreaSprite.body.setCategoryContactCallback(Rwg.CollisionCategory.WALL, function (attackBody) {
                    if (attackBody.sprite) {
                        attackBody.sprite.destroy();
                    }
                }, this);
                var damage = this.attacks[attackName].damage;
                hitAreaSprite.body.setCategoryContactCallback(this.attackCollision, function (attackBody, attackedBody) {
                    if (attackBody.sprite) {
                        attackBody.sprite.destroy();
                        if (attackedBody.sprite.sendDamageUpdate) {
                            this.game.state.getCurrentState().player.sendDamageUpdate(this.name, damage);
                        }
                    }
                }, this);
                return hitAreaSprite;
            };
        };
        AttackProvider.prototype.getCheckRangeForAttackMethod = function (attackName) {
            return function () {
                this.attacks[attackName].created.forEach(function (member, range) {
                    if (member.alive) {
                        if (Phaser.Point.distance(member.position, member.origin, true) > range) {
                            member.destroy();
                        }
                    }
                }, this, true, this.attacks[attackName].range);
            };
        };
        return AttackProvider;
    }());
    Rwg.AttackProvider = AttackProvider;
})(Rwg || (Rwg = {}));
/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enum/MessageType.ts" />
/// <reference path="../enum/ActionTypes.ts" />
var Rwg;
(function (Rwg) {
    var AttackControlProvider = (function () {
        function AttackControlProvider(args) {
            this.name = args.name;
            this.coolDown = args.coolDown;
            this.activationKey = args.activationKey;
            this.icon = args.icon;
        }
        AttackControlProvider.prototype.provide = function (game, character) {
            character.attacks[this.name].attackTime = 0;
            character.attacks[this.name].coolDown = this.coolDown;
            character.attacks[this.name].triggerAttack = this.getTriggerAttackMethod(this.name).bind(character);
            character.attacks[this.name].icon = this.icon;
            character.attacks[this.name].activationKey = this.activationKey;
            character.attacks[this.name].select = this.getAttackSelectedMethod(this.name).bind(character);
        };
        AttackControlProvider.prototype.getTriggerAttackMethod = function (attackName) {
            return function () {
                if (this.game.time.now > this.attacks[attackName].attackTime &&
                    this.attacks[attackName].created.total < this.attacks[attackName].cadence) {
                    var message = {
                        type: Rwg.MessageType.ATTACK,
                        name: this.name,
                        targetX: Math.floor(this.game.input.worldX),
                        targetY: Math.floor(this.game.input.worldY),
                        x: Math.floor(this.x),
                        y: Math.floor(this.y),
                        attackName: attackName
                    };
                    this.game.ws.send(message);
                    // sets a time out when the controlls will be available again
                    this.movementControlEnable = false;
                    this.game.time.events.add(this.attacks[attackName].attackSpeed, function () {
                        this.movementControlEnable = true;
                    }, this);
                    this.attacks[attackName].attack(message);
                    this.attacks[attackName].attackTime = this.game.time.now + this.attacks[attackName].coolDown;
                }
            };
        };
        AttackControlProvider.prototype.getAttackSelectedMethod = function (attackName) {
            return function () {
                this.currentLeftClickAction = this.attacks[attackName].triggerAttack;
                if (this.currentSelectedSkill) {
                    this.skills[this.currentSelectedSkill].releaseSkill(true);
                }
            };
        };
        return AttackControlProvider;
    }());
    Rwg.AttackControlProvider = AttackControlProvider;
})(Rwg || (Rwg = {}));
/// <reference path="../super/BaseChar.ts" />
/// <reference path="../factories/CharAnimFactory.ts" />
var Rwg;
(function (Rwg) {
    var SkillProvider = (function () {
        function SkillProvider(args) {
            this.name = args.name;
            this.castingSpeed = args.castingSpeed;
            this.effect = args.effect;
            this.anim = args.anim;
            this.skillReadyIn = args.skillReadyIn;
            this.animationFrames = args.animationFrames;
        }
        SkillProvider.prototype.provide = function (game, player) {
            player.skills[this.name] = {};
            player.skills[this.name].effect = this.effect.bind(player);
            player.skills[this.name].skillThrown = this.getSkillThrownMethod(this.name).bind(player);
            player.skills[this.name].castingSpeed = this.castingSpeed;
            player.skills[this.name].skillReadyIn = this.skillReadyIn;
            player.skills[this.name].name = this.name;
            // this is an empty method to store an additional trigger behaviour like the skill icon or the casting bar
            player.skills[this.name].additionalOnTriggerCallBack = function () { };
            // casting animations
            var animationFactory = new Rwg.CharAnimFactory(this.anim);
            player.skills[this.name].playCastAnimationTowards = animationFactory.getPlayAnimationTowardsMethod(this.name, player, player.skills[this.name].castingSpeed).bind(player);
        };
        SkillProvider.prototype.getSkillThrownMethod = function (skillName) {
            return function (message) {
                // fix the character position and stop movement
                this.moveCharacterToXY(message.x, message.y);
                var aheadPoint = this.getAheadPointBaseOnCurrentFrame();
                this.skills[skillName].playCastAnimationTowards(aheadPoint.x, aheadPoint.y);
                var skillThrownTime = this.skills[skillName].castingSpeed;
                if (this.skills[skillName].skillReadyIn != undefined) {
                    skillThrownTime = skillThrownTime * this.skills[skillName].skillReadyIn;
                }
                this.skills[skillName].additionalOnTriggerCallBack(skillThrownTime);
                this.game.time.events.add(skillThrownTime, function () {
                    this.skills[skillName].effect(message.target);
                }, this);
            };
        };
        return SkillProvider;
    }());
    Rwg.SkillProvider = SkillProvider;
})(Rwg || (Rwg = {}));
/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enums/MessageType.ts" />
/// <reference path="../factories/CharAnimFactory.ts" />
var Rwg;
(function (Rwg) {
    var TargetSkillControlProvider = (function () {
        function TargetSkillControlProvider(args) {
            this.name = args.name;
            this.range = args.range;
            this.coolDown = args.coolDown;
            this.activationKey = args.activationKey;
            this.maxTargetsSelected = args.maxTargetsSelected;
            this.targetOnAlly = args.targetOnAlly;
            this.icon = args.icon;
        }
        TargetSkillControlProvider.prototype.provide = function (game, character) {
            character.skills[this.name].skillTime = 0;
            character.skills[this.name].range = this.range;
            character.skills[this.name].coolDown = this.coolDown;
            character.skills[this.name].activationKey = this.activationKey;
            character.skills[this.name].maxTargetsSelected = this.maxTargetsSelected;
            character.skills[this.name].casting = false;
            character.skills[this.name].targetOnAlly = this.targetOnAlly;
            character.skills[this.name].icon = this.icon;
            character.skills[this.name].releaseSkill = this.getReleaseSkillMethod(this.name).bind(character);
            character.skills[this.name].select = this.getSkillSelectedMethod(this.name).bind(character);
            character.skills[this.name].skillTrigger = this.getSkillTriggerMethod(this.name).bind(character);
            character.updateMethods['checkRangeFor' + this.name] = this.getCheckRangeForSkillMethod(this.name).bind(character);
        };
        TargetSkillControlProvider.prototype.getSkillSelectedMethod = function (skillName) {
            return function () {
                if (this.currentSelectedSkill) {
                    if (this.skills[skillName].casting) {
                        return;
                    }
                    this.skills[this.currentSelectedSkill].releaseSkill(true);
                }
                this.maxTargetsSelected = this.skills[skillName].maxTargetsSelected;
                this.targetsOver = [];
                this.currentSelectedSkill = skillName;
                this.currentLeftClickAction = this.skills[skillName].skillTrigger;
            };
        };
        TargetSkillControlProvider.prototype.getSkillTriggerMethod = function (skillName) {
            return function () {
                if (this.game.time.now < this.skills[skillName].skillTime) {
                    console.log('skill not ready yet');
                    return;
                }
                if (this.skills[skillName].casting) {
                    console.log('still casting');
                    return;
                }
                if (this.targetsOver.length > 0) {
                    var targets = [];
                    for (var i = 0; i < this.targetsOver.length; i++) {
                        targets.push(this.targetsOver[i].name);
                    }
                    var message = {
                        type: Rwg.MessageType.SKILL,
                        name: this.name,
                        skillName: skillName,
                        x: this.x,
                        y: this.y,
                        target: targets
                    };
                    this.movementControlEnable = false;
                    this.skills[skillName].casting = true;
                    this.game.time.events.add(this.skills[skillName].castingSpeed, function () {
                        this.movementControlEnable = true;
                        this.skills[skillName].releaseSkill();
                    }, this);
                    this.game.ws.send(message);
                    this.skills[skillName].skillThrown(message);
                    this.skills[skillName].skillTime = this.game.time.now + this.skills[skillName].coolDown;
                }
                else {
                    console.log('no targets selected');
                }
            };
        };
        TargetSkillControlProvider.prototype.getCheckRangeForSkillMethod = function (skillName) {
            return function () {
                var newTargets = [];
                for (var i = 0; i < this.targetsOver.length; i++) {
                    if (Phaser.Point.distance(this.targetsOver[i].position, this.position) < this.skills[skillName].range) {
                        newTargets.push(this.targetsOver[i]);
                    }
                    else {
                        this.targetsOver[i].target.visible = false;
                    }
                }
                this.targetsOver = newTargets;
            };
        };
        TargetSkillControlProvider.prototype.getReleaseSkillMethod = function (skillName) {
            return function (hardRelease) {
                for (var i = 0; i < this.targetsOver.length; i++) {
                    this.targetsOver[i].target.visible = false;
                }
                this.targetsOver = [];
                this.skills[skillName].casting = false;
                if (hardRelease) {
                    this.maxTargetsSelected = 0;
                    this.currentSelectedSkill = null;
                }
            };
        };
        return TargetSkillControlProvider;
    }());
    Rwg.TargetSkillControlProvider = TargetSkillControlProvider;
})(Rwg || (Rwg = {}));
/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enums/MessageType.ts" />
/// <reference path="../factories/CharAnimFactory.ts" />
var Rwg;
(function (Rwg) {
    var AreaSkillControlProvider = (function () {
        function AreaSkillControlProvider(args) {
            this.name = args.name;
            this.range = args.range;
            this.coolDown = args.coolDown;
            this.activationKey = args.activationKey;
            this.icon = args.icon;
        }
        AreaSkillControlProvider.prototype.provide = function (game, character) {
            character.skills[this.name].skillTime = 0;
            character.skills[this.name].range = this.range;
            character.skills[this.name].coolDown = this.coolDown;
            character.skills[this.name].activationKey = this.activationKey;
            character.skills[this.name].casting = false;
            character.skills[this.name].icon = this.icon;
            character.skills[this.name].releaseSkill = this.getReleaseSkillMethod(this.name).bind(character);
            character.skills[this.name].select = this.getSkillSelectedMethod(this.name).bind(character);
            character.skills[this.name].skillTrigger = this.getSkillTriggerMethod(this.name).bind(character);
        };
        AreaSkillControlProvider.prototype.getSkillSelectedMethod = function (skillName) {
            return function () {
                if (this.currentSelectedSkill) {
                    if (this.skills[skillName].casting) {
                        return;
                    }
                    this.skills[this.currentSelectedSkill].releaseSkill(true);
                }
                this.skillAreaTarget.range = this.skills[skillName].range;
                this.skillAreaTarget.active = true;
                this.currentSelectedSkill = skillName;
                this.currentLeftClickAction = this.skills[skillName].skillTrigger;
            };
        };
        AreaSkillControlProvider.prototype.getSkillTriggerMethod = function (skillName) {
            return function () {
                if (this.game.time.now < this.skills[skillName].skillTime) {
                    console.log('skill not ready yet');
                    return;
                }
                if (this.skills[skillName].casting) {
                    console.log('still casting');
                    return;
                }
                if (this.skillAreaTarget.visible) {
                    var message = {
                        type: Rwg.MessageType.SKILL,
                        name: this.name,
                        skillName: skillName,
                        x: this.x,
                        y: this.y,
                        target: {
                            x: this.skillAreaTarget.x,
                            y: this.skillAreaTarget.y
                        }
                    };
                    this.movementControlEnable = false;
                    this.skills[skillName].casting = true;
                    this.skillAreaTarget.active = false;
                    this.skillAreaTarget.visible = false;
                    this.game.time.events.add(this.skills[skillName].castingSpeed, function () {
                        this.movementControlEnable = true;
                        this.skillAreaTarget.active = true;
                        this.skills[skillName].releaseSkill();
                    }, this);
                    this.game.ws.send(message);
                    this.skills[skillName].skillThrown(message);
                    this.skills[skillName].skillTime = this.game.time.now + this.skills[skillName].coolDown;
                }
            };
        };
        AreaSkillControlProvider.prototype.getReleaseSkillMethod = function (skillName) {
            return function (hardRelease) {
                this.skills[skillName].casting = false;
                if (hardRelease) {
                    this.skillAreaTarget.range = 0;
                    this.skillAreaTarget.active = false;
                    this.skillAreaTarget.visible = false;
                }
            };
        };
        return AreaSkillControlProvider;
    }());
    Rwg.AreaSkillControlProvider = AreaSkillControlProvider;
})(Rwg || (Rwg = {}));
/// <reference path="../super/BaseChar.ts" />
var Rwg;
(function (Rwg) {
    var SpriteUIProvider = (function () {
        function SpriteUIProvider() {
        }
        SpriteUIProvider.prototype.provide = function (game, character) {
            character.spriteUi = game.add.group();
            // creates the sprite UI only for other players
            if (game.state.getCurrentState().player) {
                this.provideMiniHealthBar(game, character);
                this.provideCharLabel(game, character);
            }
            // manual anchor implementation for the group
            character.spriteUi.anchor = {};
            character.spriteUi.anchor.x = 0;
            character.spriteUi.anchor.y = -((character.height / 2) + 15);
            var plus = 0;
            if ((character.width / 2) != 25) {
                plus = 25 - (character.width / 2);
            }
            character.spriteUi.anchor.x = -((character.width / 2) + plus);
            // updates the position of the ui every time the sprites updates
            character.updateMethods['SpriteUIFixPosition'] = function () {
                this.spriteUi.position.y = this.y + this.spriteUi.anchor.y;
                this.spriteUi.position.x = this.x + this.spriteUi.anchor.x;
            }.bind(character);
            character.spriteUi.visible = true;
            character.events.onDestroy.add(function () {
                this.spriteUi.destroy();
            }, character);
        };
        SpriteUIProvider.prototype.provideMiniHealthBar = function (game, character) {
            // mini life bar
            var miniLifeBarFrame = game.add.graphics(0, 0);
            miniLifeBarFrame.beginFill(0x000000);
            miniLifeBarFrame.drawRect(0, 0, 50, 4);
            var miniLifeBarHealth = game.add.graphics(1, 1);
            if (game.state.getCurrentState().player.team == character.team) {
                miniLifeBarHealth.beginFill(0x00ff00);
            }
            else {
                miniLifeBarHealth.beginFill(0xff0000);
            }
            miniLifeBarHealth.drawRect(0, 0, 48, 2);
            miniLifeBarHealth.currentHP = -1;
            character.spriteUi.add(miniLifeBarFrame);
            character.spriteUi.add(miniLifeBarHealth);
            character.updateMethods['changeInMiniLifeBar'] = function () {
                if (miniLifeBarHealth.currentHP != this.currentHP) {
                    var width = (this.currentHP * 48) / this.maxHP;
                    miniLifeBarHealth.width = width;
                }
            }.bind(character);
        };
        SpriteUIProvider.prototype.provideCharLabel = function (game, character) {
            // title
            var label = game.add.text(0, -8, character.name, { font: "bold 12px Arial", fill: "#ffffff", boundsAlignH: "center", boundsAlignV: "middle" });
            label.stroke = '#000000';
            label.strokeThickness = 4;
            label.setTextBounds(0, 0, character.spriteUi.width, character.spriteUi.height);
            character.spriteUi.add(label);
        };
        return SpriteUIProvider;
    }());
    Rwg.SpriteUIProvider = SpriteUIProvider;
})(Rwg || (Rwg = {}));
/// <reference path="../super/BaseChar.ts" />
/// <reference path="../enums/SkillTypes.ts" />
/// <reference path="../enums/ActionTypes.ts" />
/// <reference path="../enums/CollisionCategory.ts" />
/// <reference path="../providers/MovementControlProvider.ts" />
/// <reference path="../providers/AttackProvider.ts" />
/// <reference path="../providers/AttackControlProvider.ts" />
/// <reference path="../providers/SkillProvider.ts" />
/// <reference path="../providers/TargetSkillControlProvider.ts" />
/// <reference path="../providers/AreaSkillControlProvider.ts" />
/// <reference path="../providers/SpriteUIProvider.ts" />
var Rwg;
(function (Rwg) {
    var CharFactory = (function () {
        function CharFactory() {
        }
        CharFactory.getChar = function (args, game) {
            // validators for the char argument
            if (!(game && args.atlasName && args.framesPerMovement && args.name)) {
                throw new Error('Error creating character - missing arguments ' +
                    'game && args.atlasName && args.framesPerMovement && args.name');
            }
            CharFactory.checkFrames(game, args.atlasName, args.framesPerMovement);
            var newChar = new Rwg.BaseChar(game, args.name, args.atlasName, args.framesPerMovement, args.scale);
            newChar.movementSpeed = args.movementSpeed;
            newChar.staticMass = args.staticMass;
            newChar.dinamicMass = args.dinamicMass;
            newChar.team = args.team;
            // health settings
            if (args.health) {
                newChar.maxHP = args.health.maxHP;
                newChar.currentHP = args.health.maxHP;
                newChar.regenHPperSec = args.health.regenHPperSec;
                newChar.maxMP = args.health.maxMP;
                newChar.currentMP = args.health.maxMP;
                newChar.regenMPperSec = args.health.regenMPperSec;
            }
            if (args.controlable) {
                (new Rwg.MovementControlProvider()).provide(newChar);
            }
            if (args.attacks) {
                newChar.attacks = {};
                for (var i = 0; i < args.attacks.length; i++) {
                    (new Rwg.AttackProvider(args.attacks[i])).provide(game, newChar);
                }
            }
            if (args.skills) {
                newChar.skills = {};
                for (var i = 0; i < args.skills.length; i++) {
                    (new Rwg.SkillProvider(args.skills[i])).provide(game, newChar);
                }
            }
            if (args.attackControls || args.skillControls) {
                newChar.currentLeftClickAction = null;
                newChar.currentSelectedSkill = null;
                newChar.updateMethods['leftClickAction'] = function () {
                    if (this.game.input.activePointer.leftButton.isDown && this.currentLeftClickAction) {
                        this.currentLeftClickAction();
                    }
                }.bind(newChar);
            }
            if (args.attackControls) {
                for (var i = 0; i < args.attackControls.length; i++) {
                    (new Rwg.AttackControlProvider(args.attackControls[i])).provide(game, newChar);
                }
            }
            if (args.skillControls) {
                if (CharFactory.useSkillType(args.skillControls, Rwg.SkillTypes.TARGET)) {
                    newChar.maxTargetsSelected = 0;
                    newChar.targetsOver = [];
                    newChar.canTarget = true;
                    CharFactory.addTargetMethods(newChar);
                }
                if (CharFactory.useSkillType(args.skillControls, Rwg.SkillTypes.AREA)) {
                    CharFactory.addSkillAreaMethods(game, newChar);
                }
                for (var i = 0; i < args.skillControls.length; i++) {
                    switch (args.skillControls[i].type) {
                        case Rwg.SkillTypes.TARGET:
                            (new Rwg.TargetSkillControlProvider(args.skillControls[i])).provide(game, newChar);
                            break;
                        case Rwg.SkillTypes.AREA:
                            (new Rwg.AreaSkillControlProvider(args.skillControls[i])).provide(game, newChar);
                    }
                }
            }
            var state = game.state.getCurrentState();
            if (args.targetable && args.name != state.player.name) {
                state.player.addTargetable(newChar);
            }
            (new Rwg.SpriteUIProvider()).provide(game, newChar);
            if (args.debugBody) {
                game.renderMethods['debugBody' + args.name] = function () {
                    this.game.debug.body(newChar);
                }.bind(newChar);
            }
            // setUp the colision detection
            // the damageHitbox will response to ATTACK category colisions
            newChar.damageHitbox.m_filter.maskBits = Rwg.CollisionCategory.ATTACK;
            if (newChar.team) {
                // the category of the hit area of this character will be TEAM_ONE_HITBOX
                newChar.damageHitbox.m_filter.categoryBits = Rwg.CollisionCategory.TEAM_ONE_HITBOX;
                // the attack will response to colision with TEAM_ZERO_HITBOX and WALL
                newChar.attackMask = Rwg.CollisionCategory.TEAM_ZERO_HITBOX | Rwg.CollisionCategory.WALL;
                // the attack will do something special when it colides with TEAM_ZERO_HITBOX
                newChar.attackCollision = Rwg.CollisionCategory.TEAM_ZERO_HITBOX;
            }
            else {
                // same as avobe
                newChar.damageHitbox.m_filter.categoryBits = Rwg.CollisionCategory.TEAM_ZERO_HITBOX;
                newChar.attackMask = Rwg.CollisionCategory.TEAM_ONE_HITBOX | Rwg.CollisionCategory.WALL;
                newChar.attackCollision = Rwg.CollisionCategory.TEAM_ONE_HITBOX;
            }
            // adds the send damage method
            if (!state.player) {
                CharFactory.addSendDamageUpdateMethod(newChar);
            }
            return newChar;
        };
        CharFactory.useSkillType = function (skillControls, skillType) {
            for (var i = 0; i < skillControls.length; i++) {
                if (skillControls[i].type == skillType) {
                    return true;
                }
            }
            return false;
        };
        CharFactory.addSkillAreaMethods = function (game, character) {
            character.skillAreaTarget = game.add.sprite(80, 80, 'target');
            character.skillAreaTarget.visible = false;
            character.skillAreaTarget.anchor.set(0.5, 0.5);
            character.skillAreaTarget.range = 0;
            character.skillAreaTarget.active = false;
            character.updateMethods['skillArePointer'] = function () {
                if (this.skillAreaTarget.active) {
                    var cursorPoint = new Phaser.Point(Math.floor(this.game.input.worldX), Math.floor(this.game.input.worldY));
                    if (Phaser.Point.distance(cursorPoint, this.position) < character.skillAreaTarget.range) {
                        this.skillAreaTarget.position = cursorPoint;
                        this.skillAreaTarget.visible = true;
                    }
                    else {
                        this.skillAreaTarget.visible = false;
                    }
                }
            }.bind(character);
        };
        CharFactory.addTargetMethods = function (character) {
            character.addTargetable = function (targetable) {
                targetable.target = this.game.add.sprite(targetable.x, targetable.y, 'target');
                targetable.target.position = targetable.position;
                targetable.target.visible = false;
                targetable.target.anchor.set(0.5, 0.5);
                targetable.events.onInputOver.add(this.targetOver, this);
                targetable.inputEnabled = true;
            }.bind(character);
            character.targetOver = function (targetedChar) {
                if (this.targetsOver.length < this.maxTargetsSelected) {
                    for (var i = 0; i < this.targetsOver.length; i++) {
                        if (this.targetsOver[i].name == targetedChar.name) {
                            return;
                        }
                    }
                    if (this.skills[this.currentSelectedSkill].targetOnAlly) {
                        if (targetedChar.team == this.team) {
                            this.targetsOver.push(targetedChar);
                            targetedChar.target.visible = true;
                        }
                    }
                    else {
                        if (targetedChar.team != this.team) {
                            this.targetsOver.push(targetedChar);
                            targetedChar.target.visible = true;
                        }
                    }
                }
            }.bind(character);
        };
        CharFactory.addSendDamageUpdateMethod = function (character) {
            character.sendDamageUpdate = function (hittedBy, damage) {
                // updates the hitted stack for calculating the assists
                var now = this.game.time.now;
                this.hittedStack.push({ name: hittedBy, time: now });
                var killed = false;
                var assist = [];
                if ((this.currentHP - damage) < 0) {
                    this.currentHP = this.maxHP;
                    this.killed = true;
                    // if killed create a new list of assists players
                    for (var i = 0; i < this.hittedStack.length; i++) {
                        if (now - this.hittedStack[i].time > 10000) {
                            if (this.hittedStack[i].name != hittedBy) {
                                assist.push(this.hittedStack[i].name);
                            }
                        }
                    }
                }
                else {
                    this.currentHP -= damage;
                }
                var message = {
                    type: Rwg.MessageType.DAMAGE,
                    name: this.name,
                    hittedBy: hittedBy,
                    killed: this.killed,
                    currentHP: this.currentHP,
                    assist: assist
                };
                this.game.ws.send(message);
            }.bind(character);
        };
        /*
         *
         * VALIDATION SECTION
         *
         */
        CharFactory.checkFrames = function (game, atlasName, framesPerMovement) {
            var baseFrames = ['standDown.png', 'standUp.png', 'standLeft.png', 'standRight.png'];
            for (var i = 1; i <= framesPerMovement; i++) {
                baseFrames.push('moveRight' + i + '.png');
                baseFrames.push('moveLeft' + i + '.png');
                baseFrames.push('moveUp' + i + '.png');
                baseFrames.push('moveDown' + i + '.png');
            }
            var missingFrames = [];
            for (var i = 0; i < baseFrames.length; i++) {
                if (!game.cache.getFrameByName(atlasName, baseFrames[i])) {
                    missingFrames.push(atlasName + '/' + baseFrames[i]);
                }
            }
            if (missingFrames.length > 0) {
                throw new Error('Error creating character - missing frames [' + missingFrames + ']');
            }
        };
        return CharFactory;
    }());
    Rwg.CharFactory = CharFactory;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    var SkillContainer = (function () {
        function SkillContainer(game) {
            this.game = game;
            this.player = game.state.getCurrentState().player;
            this.skillContainer = this.game.add.group();
            this.x = Math.floor(this.game.width / 2) - 111;
            this.y = this.game.height - 44;
            this.skillIcons = {};
            var index = this.drawSkillIcons(this.player.attacks, 0);
            this.drawSkillIcons(this.player.skills, index);
            this.drawSkillBarAndSelectedSkillTarget();
            this.drawCastingBar();
            this.addChangeTargetWhenSkillSelected();
            this.addCoolDownAnimation();
            this.addChangeActivationKeyMethod();
        }
        SkillContainer.prototype.drawSkillIcons = function (skillsOrAttacks, startIndex) {
            var i = startIndex;
            for (var key in skillsOrAttacks) {
                // only if skill has controles
                if (skillsOrAttacks[key].select != undefined) {
                    var x = this.x + 6;
                    var y = this.y + 6;
                    if (i > 0) {
                        x += (32 + 4) * i;
                    }
                    this.skillIcons[key] = this.skillContainer.create(x, y, 'uiAtlas', skillsOrAttacks[key].icon);
                    this.skillIcons[key].coolDownCover = this.drawSkillCoolDownCovers(x, y);
                    i++;
                }
            }
            return i;
        };
        SkillContainer.prototype.drawSkillCoolDownCovers = function (x, y) {
            var clearCover = this.game.add.graphics(x, y);
            clearCover.alpha = 0.5;
            clearCover.beginFill(0xffffff);
            clearCover.drawRect(0, 0, 32, 32);
            clearCover.visible = false;
            var cover = this.game.add.graphics(x + 16, y + 16);
            cover.visible = false;
            cover.alpha = 0.9;
            cover.beginFill(0x000000);
            cover.arc(0, 0, 24, this.game.math.degToRad(15), this.game.math.degToRad(360), true);
            cover.endFill();
            var coverMask = this.game.add.graphics(x, y);
            coverMask.beginFill(0xffffff);
            coverMask.drawRect(0, 0, 32, 32);
            cover.mask = coverMask;
            this.skillContainer.addChild(clearCover);
            this.skillContainer.addChild(cover);
            this.skillContainer.addChild(coverMask);
            return { cover: cover, clearCover: clearCover };
        };
        SkillContainer.prototype.drawSkillBarAndSelectedSkillTarget = function () {
            this.skillContainer.create(this.x, this.y, 'uiAtlas', 'emptySkillContainer.png');
            this.selectedSkillMarginSprite = this.skillContainer.create(this.x, this.y, 'uiAtlas', 'selectedSkill.png');
            this.selectedSkillMarginSprite.visible = false;
        };
        SkillContainer.prototype.drawCastingBar = function () {
            var x = Math.floor(this.game.width / 2) - 165;
            var y = Math.floor(this.game.height * 0.9) - 8;
            this.castingBarContent = this.game.add.tileSprite(x + 3, y + 3, 325, 11, 'uiAtlas', 'cast.png');
            this.skillContainer.addChild(this.castingBarContent);
            this.castingBarContent.visible = false;
            this.castingBar = this.skillContainer.create(x, y, 'uiAtlas', 'emptyBar.png');
            this.castingBar.visible = false;
        };
        SkillContainer.prototype.addChangeTargetWhenSkillSelected = function () {
            var _loop_1 = function(key) {
                var selectedSkillMarginSprite = this_1.selectedSkillMarginSprite;
                var x = this_1.skillIcons[key].x;
                var y = this_1.skillIcons[key].y;
                var skill = null;
                if (this_1.player.attacks[key]) {
                    skill = this_1.player.attacks[key];
                }
                else if (this_1.player.skills[key]) {
                    skill = this_1.player.skills[key];
                }
                var castingBar = this_1.castingBar;
                var oldSkillSelectedFunction = skill.select;
                var setCurrentSkillInSkillBar = function (skill) {
                    this.currentSkillInSkillBar = skill;
                }.bind(this_1);
                var newSkillSelectedFunction = function () {
                    if (!castingBar.visible) {
                        setCurrentSkillInSkillBar(skill); // callback to select the currentSkillInSkillBar
                        oldSkillSelectedFunction();
                        selectedSkillMarginSprite.x = x;
                        selectedSkillMarginSprite.y = y;
                        selectedSkillMarginSprite.visible = true;
                    }
                };
                skill.select = newSkillSelectedFunction.bind(this_1.player);
                var activationKey = this_1.game.input.keyboard.addKey(skill.activationKey);
                activationKey.onDown.add(skill.select, this_1.player);
                // adds the char label to the skill
                var xCharPos = this_1.skillIcons[key].x + 2;
                var yCharPos = this_1.skillIcons[key].y;
                var keyLabel = this_1.game.add.text(xCharPos, yCharPos, String.fromCharCode(skill.activationKey), { font: "bold 12px Arial", fill: "#ffffff" });
                keyLabel.stroke = '#000000';
                keyLabel.strokeThickness = 4;
                this_1.skillContainer.add(keyLabel);
                this_1.skillIcons[key].keyLabel = keyLabel;
            };
            var this_1 = this;
            for (var key in this.skillIcons) {
                _loop_1(key);
            }
        };
        SkillContainer.prototype.changeSkillKey = function (char) {
            if (this.currentSkillInSkillBar) {
                var activationKey = this.game.input.keyboard.addKey(this.currentSkillInSkillBar.activationKey);
                activationKey.onDown.removeAll();
                this.currentSkillInSkillBar.activationKey = char;
                activationKey = this.game.input.keyboard.addKey(this.currentSkillInSkillBar.activationKey);
                activationKey.onDown.add(this.currentSkillInSkillBar.select.bind(this.player), this.player);
                // adds the char label to the skill
                this.skillIcons[this.currentSkillInSkillBar.name].keyLabel.text = String.fromCharCode(char);
            }
        };
        SkillContainer.prototype.addChangeActivationKeyMethod = function () {
            var forbiden = [Phaser.KeyCode.A, Phaser.KeyCode.W, Phaser.KeyCode.S, Phaser.KeyCode.D, Phaser.KeyCode.L];
            var l = this.game.input.keyboard.addKey(Phaser.KeyCode.L);
            l.onHoldCallback = function () {
                if (forbiden.indexOf(this.game.input.keyboard.event.which) == -1) {
                    this.changeSkillKey(this.game.input.keyboard.event.which);
                }
            }.bind(this);
        };
        SkillContainer.prototype.addCoolDownAnimation = function () {
            var _loop_2 = function(key) {
                var skill = null;
                if (this_2.player.attacks[key]) {
                    skill = this_2.player.attacks[key];
                }
                else if (this_2.player.skills[key]) {
                    skill = this_2.player.skills[key];
                }
                var x = this_2.skillIcons[key].x;
                var y = this_2.skillIcons[key].y;
                var coolDownCover = this_2.skillIcons[key].coolDownCover;
                // for the casting bar
                var castingBar = this_2.castingBar;
                var castingBarContent = this_2.castingBarContent;
                skill.additionalOnTriggerCallBack = function (actionTime) {
                    var timer = this.game.time.create(false);
                    var elapsed = 0;
                    var angle = 0;
                    var width = 0;
                    coolDownCover.cover.visible = true;
                    coolDownCover.clearCover.visible = true;
                    // if requieres casting bar
                    if (skill.castingSpeed) {
                        castingBarContent.width = 0;
                        castingBarContent.visible = true;
                        castingBar.visible = true;
                    }
                    timer.loop(50, function () {
                        elapsed += 50;
                        // for the skill icon
                        angle = Math.floor((elapsed * 360) / skill.coolDown);
                        coolDownCover.cover.clear();
                        coolDownCover.cover.beginFill(0x000000);
                        coolDownCover.cover.arc(0, 0, 24, this.game.math.degToRad(0), this.game.math.degToRad(angle), true);
                        coolDownCover.cover.endFill();
                        if (elapsed > skill.coolDown && coolDownCover.cover.visible) {
                            coolDownCover.cover.clear();
                            coolDownCover.cover.beginFill(0x000000);
                            coolDownCover.cover.arc(0, 0, 24, this.game.math.degToRad(0), this.game.math.degToRad(angle), true);
                            coolDownCover.cover.endFill();
                            coolDownCover.cover.visible = false;
                            coolDownCover.clearCover.visible = false;
                        }
                        // for the cast bar
                        if (skill.castingSpeed) {
                            castingBarContent.width = Math.floor((elapsed * 325) / skill.castingSpeed);
                            if (elapsed > skill.castingSpeed && castingBar.visible) {
                                castingBarContent.width = 0;
                                castingBarContent.visible = false;
                                castingBar.visible = false;
                            }
                        }
                        if (!coolDownCover.cover.visible && !castingBarContent.visible) {
                            timer.stop();
                        }
                    }, this);
                    timer.start();
                }.bind(this_2.player);
            };
            var this_2 = this;
            for (var key in this.skillIcons) {
                _loop_2(key);
            }
        };
        return SkillContainer;
    }());
    Rwg.SkillContainer = SkillContainer;
})(Rwg || (Rwg = {}));
var Rwg;
(function (Rwg) {
    var LeaderBoard = (function () {
        function LeaderBoard(game, initPlayersScore) {
            this.game = game;
            this.board = this.game.add.group();
            this.board.visible = false;
            this.players = initPlayersScore;
            this.displayLeaderBoard();
            this.generateDisplayBoardMethod();
        }
        LeaderBoard.prototype.displayLeaderBoard = function () {
            this.sort();
            this.board.removeAll();
            this.drawBoard();
        };
        LeaderBoard.prototype.addPlayer = function (player) {
            this.players.push({ name: player.name, character: player.character, kill: 0, assist: 0, death: 0, score: 0 });
            this.sort();
            this.board.removeAll();
            this.drawBoard();
        };
        LeaderBoard.prototype.exists = function (playerName) {
            for (var i = this.players.length - 1; i >= 0; i--) {
                if (this.players[i].name == playerName) {
                    return true;
                }
            }
            ;
            return false;
        };
        LeaderBoard.prototype.updateBoardInfoKill = function (name, kill) {
            var found = false;
            for (var i = 0; i < this.players.length; i++) {
                if (this.players[i].name == name) {
                    this.players[i].kill = kill;
                    this.players[i].score = (this.players[i].kill * 10) + (this.players[i].assist * 0.5); // + (this.players[i].death*(-1));
                    found = true;
                }
            }
            this.sort();
            this.board.removeAll();
            this.drawBoard();
        };
        LeaderBoard.prototype.updateBoardInfoAssist = function (name, assist) {
            var found = false;
            for (var i = 0; i < this.players.length; i++) {
                if (this.players[i].name == name) {
                    this.players[i].assist = assist;
                    this.players[i].score = (this.players[i].kill * 10) + (this.players[i].assist * 5); //+ (this.players[i].death*(-1));
                    found = true;
                }
            }
            this.sort();
            this.board.removeAll();
            this.drawBoard();
        };
        LeaderBoard.prototype.updateBoardInfoDeath = function (name, death) {
            var found = false;
            for (var i = 0; i < this.players.length; i++) {
                if (this.players[i].name == name) {
                    this.players[i].death = death;
                    this.players[i].score = (this.players[i].kill * 10) + (this.players[i].assist * 5); //+ (this.players[i].death*(-1));
                    found = true;
                }
            }
            this.sort();
            this.board.removeAll();
            this.drawBoard();
        };
        LeaderBoard.prototype.generateDisplayBoardMethod = function () {
            var shift = this.game.input.keyboard.addKey(Phaser.KeyCode.SHIFT);
            shift.onDown.add(function () {
                this.board.visible = true;
            }, this);
            shift.onUp.add(function () {
                this.board.visible = false;
            }, this);
        };
        LeaderBoard.prototype.drawBoard = function () {
            var x = 540;
            var y = 20;
            // top leader board sprite
            this.board.create(x, y, 'uiAtlas', 'leaderBoardTop.png');
            y += 6;
            // leader board content
            var height = this.getLeaderBoardContent();
            this.boardContainer = this.game.add.tileSprite(x, y, 235, height, 'uiAtlas', 'leaderBoardSegment.png');
            this.board.add(this.boardContainer);
            // leader board tile
            var title = this.game.add.text(x + 20, y + 2, 'Leader Board', { font: "bold 16px Arial", fill: "#ffffff" });
            title.stroke = '#000000';
            title.strokeThickness = 4;
            this.board.add(title);
            y += title.height + 4; //33 px
            // content
            for (var i = 0; i < this.players.length; i++) {
                y += this.addLine((i + 1) + '. ' + this.players[i].name, this.players[i], x, y);
            }
            // leaderBoardBottom
            this.board.create(x, height + 26, 'uiAtlas', 'leaderBoardBottom.png');
        };
        LeaderBoard.prototype.addLine = function (name, player, x, y) {
            var line = this.game.add.text(x + 20, y, name + ' : ' + player.kill + '/' + player.assist + '/' + player.death + ' score: ' + player.score, { font: '14px Arial', fill: "#ffffff" });
            line.stroke = '#000000';
            line.strokeThickness = 3;
            this.board.add(line);
            return line.height + 1; // 26 px
        };
        LeaderBoard.prototype.getLeaderBoardContent = function () {
            var height = 33;
            height = 26 * (this.players.length + 1);
            return height;
        };
        LeaderBoard.prototype.sort = function () {
            this.players.sort(function (a, b) {
                return b.score - a.score;
            });
        };
        return LeaderBoard;
    }());
    Rwg.LeaderBoard = LeaderBoard;
})(Rwg || (Rwg = {}));
/// <reference path="SkillContainer.ts" />
/// <reference path="LeaderBoard.ts" />
var Rwg;
(function (Rwg) {
    var Ui = (function () {
        function Ui(game, initPlayersScore) {
            this.game = game;
            this.ui = this.game.add.group();
            this.ui.fixedToCamera = true;
            this.skillContainer = this.ui.addChild(new Rwg.SkillContainer(game).skillContainer);
            this.leaderBoard = new Rwg.LeaderBoard(game, initPlayersScore);
            this.ui.addChild(this.leaderBoard.board);
            this.createHealthBars();
        }
        Ui.prototype.createHealthBars = function () {
            this.ui.create(20, 10, 'uiAtlas', 'hartIcon.png');
            // HP BAR
            var hpBarContent = this.game.add.tileSprite(63, 8, 325, 11, 'uiAtlas', 'hp.png');
            this.ui.addChild(hpBarContent);
            var hpBar = this.ui.create(60, 5, 'uiAtlas', 'emptyBar.png');
            this.game.world.bringToTop(hpBar);
            hpBar.currentHP = -1;
            var state = this.game.state.getCurrentState();
            state.player.updateMethods['updateLifeBar'] = function () {
                if (hpBar.currentHP != this.currentHP) {
                    var width = (this.currentHP * 327) / this.maxHP;
                    hpBarContent.width = width;
                    hpBar.currentHP = this.currentHP;
                }
            }.bind(state.player);
            // MP BAR
            var mpBarContent = this.game.add.tileSprite(63, 28, 325, 11, 'uiAtlas', 'mp.png');
            this.ui.addChild(mpBarContent);
            var mpBar = this.ui.create(60, 25, 'uiAtlas', 'emptyBar.png');
        };
        return Ui;
    }());
    Rwg.Ui = Ui;
})(Rwg || (Rwg = {}));
/// <reference path="../base/BaseChar.ts" />
/// <reference path="../enums/CollisionCategory.ts" />
var Rwg;
(function (Rwg) {
    var StageCollisionFactory = (function () {
        function StageCollisionFactory(args) {
        }
        StageCollisionFactory.prototype.getCollisionObjects = function (game, objectsList, debug) {
            var _loop_3 = function(i) {
                //creates the obstacules
                var object = objectsList[i];
                var sprite = game.add.sprite(object.x, object.y);
                game.physics.box2d.enable(sprite);
                var vertices = [];
                for (var j = 1; j < object.polyline.length; j++) {
                    vertices.push(object.polyline[j][0]);
                    vertices.push(object.polyline[j][1]);
                }
                sprite.body.setPolygon(vertices);
                sprite.body.static = true;
                sprite.body.setCollisionCategory(Rwg.CollisionCategory.WALL);
                // render methods
                if (debug) {
                    game.renderMethods['debugTheObject' + object.name] = function () {
                        game.debug.body(sprite);
                    }.bind(this_3);
                }
            };
            var this_3 = this;
            for (var i = 0; i < objectsList.length; i++) {
                _loop_3(i);
            }
        };
        return StageCollisionFactory;
    }());
    Rwg.StageCollisionFactory = StageCollisionFactory;
})(Rwg || (Rwg = {}));
/// <reference path="../core/super/BaseChar.ts" />
/// <reference path="../core/factories/CharFactory.ts" />
/// <reference path="../characters/CharacterSelecter.ts" />
/// <reference path="../ui/Ui.ts" />
/// <reference path="../core/enums/MessageType.ts" />
/// <reference path="../core/factories/StageCollisionFactory.ts" />
var Rwg;
(function (Rwg) {
    var ForestTown = (function (_super) {
        __extends(ForestTown, _super);
        function ForestTown() {
            _super.apply(this, arguments);
        }
        ForestTown.prototype.init = function (initParam) {
            //disable the game block in background
            this.game.stage.disableVisibilityChange = true;
            // crates the players group
            this.playersGroup = this.game.add.group();
            this.players = {};
            // creates the player character
            var charArgs = Rwg.CharacterSelecter.getCharacterArgs(initParam.character);
            charArgs.base.name = initParam.name;
            charArgs.base.attackControls = charArgs.attackControls;
            charArgs.base.skillControls = charArgs.skillControls;
            charArgs.base.controlable = true;
            charArgs.base.team = initParam.team;
            // creates the new character base on the arguments
            this.player = Rwg.CharFactory.getChar(charArgs.base, this.game);
            this.player.character = initParam.character;
            this.playersGroup.add(this.player);
            // setUp the collisions for the user player
            this.ui = new Rwg.Ui(this.game, initParam.playerScores);
        };
        ForestTown.prototype.create = function () {
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
            var background = this.map.createLayer('background');
            var foreground = this.map.createLayer('foreground');
            var top = this.map.createLayer('top');
            background.resizeWorld();
            foreground.sendToBack();
            background.sendToBack();
            this.game.physics.box2d.setBoundsToWorld();
            (new Rwg.StageCollisionFactory()).getCollisionObjects(this.game, this.map.collision.Collision, false);
            // set the respown positions for each team
            var respawnGroup = this.game.add.group();
            this.map.createFromObjects('Respawns', 'team_zero', null, null, false, false, respawnGroup);
            this.map.createFromObjects('Respawns', 'team_one', null, null, false, false, respawnGroup);
            this.respawns = {};
            this.respawns.team_zero = respawnGroup.getChildAt(0).position;
            this.respawns.team_one = respawnGroup.getChildAt(1).position;
            if (this.player.team == '1') {
                this.player.moveCharacterToXY(this.respawns.team_one.x, this.respawns.team_one.y);
                this.player.respawn = this.respawns.team_one;
            }
            else {
                this.player.moveCharacterToXY(this.respawns.team_zero.x, this.respawns.team_zero.y);
                this.player.respawn = this.respawns.team_zero;
            }
        };
        ForestTown.prototype.render = function () {
            this.game.world.bringToTop(this.ui.ui);
            this.playersGroup.sort('y', Phaser.Group.SORT_ASCENDING);
        };
        // need to whipe all the stage objects
        ForestTown.prototype.shutdown = function () {
            this.game.ws.newPlayer = function () { };
            this.game.ws.move = function () { };
            this.game.ws.velocity = function () { };
            this.game.ws.playerLeft = function () { };
            this.game.ws.attack = function () { };
            this.game.ws.skill = function () { };
            this.game.ws.damage = function () { };
            this.game.ws.gameOver = function () { };
            this.player = null;
            this.ui = null;
        };
        ForestTown.prototype.newPlayer = function (message) {
            // creates the player character
            var charArgs = Rwg.CharacterSelecter.getCharacterArgs(message.character);
            charArgs.base.name = message.name;
            charArgs.base.team = message.team;
            charArgs.base.targetable = true;
            // creates the new character base on the arguments
            var newPlayer = Rwg.CharFactory.getChar(charArgs.base, this.game);
            newPlayer.character = message.character;
            this.playersGroup.add(newPlayer);
            this.players[message.name] = newPlayer;
            // init position
            var initPos = { x: 0, y: 0 };
            // sets the respawn
            if (newPlayer.team) {
                initPos.x = this.respawns.team_one.x;
                initPos.y = this.respawns.team_one.y;
                newPlayer.respawn = this.respawns.team_one;
            }
            else {
                initPos.x = this.respawns.team_zero.x;
                initPos.y = this.respawns.team_zero.y;
                newPlayer.respawn = this.respawns.team_zero;
            }
            // set the init pos if the player already existed
            if (message.x != 0 || message.y != 0) {
                initPos = { x: message.x, y: message.y };
            }
            newPlayer.moveCharacterToXY(initPos.x, initPos.y);
            // updates the UI
            if (!this.ui.leaderBoard.exists(message.name)) {
                this.ui.leaderBoard.addPlayer(newPlayer);
            }
            this.ui.leaderBoard.updateBoardInfoKill(message.name, message.kill);
            this.ui.leaderBoard.updateBoardInfoAssist(message.name, message.assist);
            this.ui.leaderBoard.updateBoardInfoDeath(message.name, message.death);
        };
        // this process is thought if the browser windows is off of focuss and there are a new loggin 
        // that was not caught by the client
        ForestTown.prototype.requestPlayerInfo = function (name) {
            this.game.ws.send({
                type: Rwg.MessageType.REQUEST_PLAYER_INFO,
                name: name
            });
        };
        ForestTown.prototype.move = function (message) {
            if (this.player.name == message.name) {
                return;
            }
            if (this.players[message.name]) {
                this.players[message.name].moveCharacterToXY(message.x, message.y);
            }
            else {
                this.requestPlayerInfo(message.name);
            }
        };
        ForestTown.prototype.velocity = function (message) {
            if (this.player.name == message.name) {
                return;
            }
            if (this.players[message.name]) {
                this.players[message.name].setVelocity(message.x, message.y, message.velocityBitMask);
            }
        };
        ForestTown.prototype.playerLeft = function (message) {
            if (this.players[message.name]) {
                this.players[message.name].destroy();
            }
        };
        ForestTown.prototype.attack = function (message) {
            if (this.player.name == message.name) {
                return;
            }
            if (this.players[message.name]) {
                this.players[message.name].attacks[message.attackName].attack(message);
            }
        };
        ForestTown.prototype.skill = function (message) {
            if (this.player.name == message.name) {
                return;
            }
            if (this.players[message.name]) {
                this.players[message.name].skills[message.skillName].skillThrown(message);
            }
        };
        ForestTown.prototype.damage = function (message) {
            // update leader board
            if (message.killed) {
                this.ui.leaderBoard.updateBoardInfoKill(message.hittedBy, message.kill);
                if (!message.assist) {
                    message.assist = [];
                }
                ;
                for (var i = 0; i < message.assist.length; i++) {
                    this.ui.leaderBoard.updateBoardInfoAssist(message.assist[i].name, message.assist[i].assist);
                }
                ;
                this.ui.leaderBoard.updateBoardInfoDeath(message.name, message.death);
            }
            // can be any animation or somethig
            if (this.player.name == message.hittedBy && message.killed) {
                console.log('killed!!');
            }
            if (this.players[message.name]) {
                this.players[message.name].damage(message);
            }
        };
        ForestTown.prototype.gameOver = function (message) {
            // updates the leader board
            if (!message.assist) {
                message.assist = [];
            }
            ;
            this.ui.leaderBoard.updateBoardInfoKill(message.winner, message.kill);
            for (var i = 0; i < message.assist.length; i++) {
                this.ui.leaderBoard.updateBoardInfoAssist(message.assist[i].name, message.assist[i].assist);
            }
            ;
            this.ui.leaderBoard.updateBoardInfoDeath(message.name, message.death);
            var player = this.player;
            var leaderBoard = this.ui.leaderBoard.players;
            this.game.state.clearCurrentState();
            this.game.state.start('GameOver', true, false, {
                arena: 'ForestTown',
                player: player,
                leaderBoard: leaderBoard,
                winner: message.winner
            });
        };
        return ForestTown;
    }(Phaser.State));
    Rwg.ForestTown = ForestTown;
})(Rwg || (Rwg = {}));
/// <reference path="../../libs/phaser.d.ts" />
/// <reference path="states/Boot.ts" />
/// <reference path="states/EnterName.ts" />
/// <reference path="states/CharSelection.ts" />
/// <reference path="states/ArenaSelection.ts" />
/// <reference path="states/GameOver.ts" />
/// <reference path="arenas/ForestTown.ts" />
var Rwg;
(function (Rwg) {
    var Game = (function (_super) {
        __extends(Game, _super);
        function Game(ws) {
            _super.call(this, 800, 600, Phaser.AUTO, 'canvas-area');
            this.ws = ws;
            // flow
            this.state.add('Boot', Rwg.Boot, false);
            this.state.add('EnterName', Rwg.EnterName, false);
            this.state.add('CharSelection', Rwg.CharSelection, false);
            this.state.add('ArenaSelection', Rwg.ArenaSelection, false);
            this.state.add('GameOver', Rwg.GameOver, false);
            //arenas
            this.state.add('ForestTown', Rwg.ForestTown, false);
            this.state.start('Boot');
        }
        return Game;
    }(Phaser.Game));
    Rwg.Game = Game;
})(Rwg || (Rwg = {}));
/// <reference path="../core/enums/MessageType.ts" />
var Rwg;
(function (Rwg) {
    var WSConnection = (function () {
        function WSConnection(uri) {
            this.continueToCharSelection = function (message) {
                // empty method to be overwrite
            };
            this.continueToArenaSelection = function (message) {
                // empty method to be overwrite
            };
            this.initArena = function (message) {
                // empty method to be overwrite
            };
            this.newPlayer = function (message) {
                // empty method to be overwrite
            };
            this.move = function (message) {
                // empty method to be overwrite
            };
            this.velocity = function (message) {
                // empty method to be overwrite
            };
            this.playerLeft = function (message) {
                // empty method to be overwrite
            };
            this.attack = function (message) {
                // empty method to be overwrite
            };
            this.skill = function (message) {
                // empty method to be overwrite
            };
            this.damage = function (message) {
                // empty method to be overwrite
            };
            this.gameOver = function (message) {
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
                case Rwg.MessageType.NAME_SELECTION:
                    this.continueToCharSelection(message);
                    break;
                case Rwg.MessageType.CHARACTER_SELECTION:
                    this.continueToArenaSelection(message);
                    break;
                case Rwg.MessageType.ARENA_SELECTION:
                    this.initArena(message);
                    break;
                case Rwg.MessageType.NEW_PLAYER:
                    this.newPlayer(message);
                    break;
                case Rwg.MessageType.VELOCITY:
                    this.velocity(message);
                    break;
                case Rwg.MessageType.MOVE:
                    this.move(message);
                    break;
                case Rwg.MessageType.PLAYER_LEFT:
                    this.playerLeft(message);
                    break;
                case Rwg.MessageType.ATTACK:
                    this.attack(message);
                    break;
                case Rwg.MessageType.DAMAGE:
                    this.damage(message);
                    break;
                case Rwg.MessageType.SKILL:
                    this.skill(message);
                    break;
                case Rwg.MessageType.GAME_OVER:
                    this.gameOver(message);
                    break;
                default:
                    console.log('no type ' + message.type + " ---> ");
                    for (key in message) {
                        console.log(key + " : " + message[key]);
                    }
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
