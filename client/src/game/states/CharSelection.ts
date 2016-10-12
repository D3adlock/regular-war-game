/// <reference path="../core/enums/MessageType.ts" />
/// <reference path="../characters/CharacterSelecter.ts" />

module Rwg {

    export class CharSelection extends Phaser.State {

        private pointer:any;
        private begin:any;
        private slots:any;
        private end:any;

        private playerName:string;
        private character:string;

        init(message:any){
            this.playerName = message.name;
        }

        create() {

            let background = this.game.add.tileSprite(0,0,800, 600,'background');
            background.fixedToCamera = true;

            this.slots = [];

            // description Container
            let descriptionContainer = this.game.add.group();
            descriptionContainer.fixedToCamera = true;
            descriptionContainer.scale.set(2);
            descriptionContainer.create(100-32, 200, 'uiAtlas', 'containerBorderRadiusBegin.png');
            let content = this.add.tileSprite(100, 200, 200, 64, 'uiAtlas', 'containerBorderRadius.png');
            descriptionContainer.add(content);
            descriptionContainer.create(100 + 200, 200, 'uiAtlas', 'containerBorderRadiusEnd.png');

            //description Text
            let description = this.game.add.group();
            description.fixedToCamera = true;

            let descriptionText = this.textLine (0,0, CharacterSelecter.characterList[0].desc
                , 12, content.width*2);
            descriptionText.x = Math.floor(content.x + content.width / 2)*2;
            descriptionText.y = Math.floor(content.y + content.height / 2)*2;
            descriptionText.anchor.set(0.5);
            description.add(descriptionText);

            // character list
            let charList = this.game.add.group();
            charList.scale.set(2);

            // 
            let charListIcons = this.game.add.group();

            let y = 110;
            let x = 100;

            // first element
            let begin = charList.create(x,y, 'uiAtlas', 'charIconSlotBegin.png');
            charListIcons.create((x +18)*2,(y +4)*2, 'charIcons', CharacterSelecter.characterList[0].name + ".png");
            x += 18 + 32 + 4;
            this.slots.push({name: CharacterSelecter.characterList[0], icon: begin})

            // middle elements
            for (let i = 1; i <= CharacterSelecter.characterList.length - 2; i++) {
                this.slots.push({name: CharacterSelecter.characterList[i], icon: charList.create(x,y, 'uiAtlas', 'charIconSlot.png')});
                charListIcons.create((x +8)*2,(y +4)*2, 'charIcons', CharacterSelecter.characterList[i].name + ".png");
                x += 8 + 32 + 4; 
            }

            //last element
            let end = charList.create(x,y, 'uiAtlas', 'charIconSlotEnd.png');
            this.slots.push({name: CharacterSelecter.characterList[CharacterSelecter.characterList.length-1], icon: end})
            charListIcons.create((x +8)*2,(y +4)*2, 'charIcons', CharacterSelecter.characterList[CharacterSelecter.characterList.length-1].name + ".png");

            // pointer
            this.pointer = charList.create(0,0, 'uiAtlas', 'pointer.png');
            this.pointer.x = 100 + 18 + 8;
            this.pointer.y = y + 8 + 32;
            this.pointer.pos = 0;

            // movement cursor left
            let left = this.game.input.keyboard.addKey(Phaser.KeyCode.A);
            left.onDown.add(function() {
                if (this.pointer.pos != 0) {
                    this.pointer.pos--;

                    let x = 8 + 8;
                    if (this.pointer.pos == 0) {
                        x = 18 + 8;
                    }

                    this.pointer.x = this.slots[this.pointer.pos].icon.x + x;
                    descriptionText.text = CharacterSelecter.characterList[this.pointer.pos].desc;
                } 
            }, this);

            // right
            let right = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
            right.onDown.add(function() {
                if (this.pointer.pos != CharacterSelecter.characterList.length-1) {
                    this.pointer.pos++;
                    this.pointer.x = this.slots[this.pointer.pos].icon.x + 8 + 8;
                    descriptionText.text = CharacterSelecter.characterList[this.pointer.pos].desc;
                } 
            }, this);

            // resize the world
            let width = this.slots[CharacterSelecter.characterList.length-1].icon.x + 58 + 100;
            this.game.world.setBounds(0, 0, width*2, 600);

            this.game.camera.follow(this.pointer);

            // instructions
            let instructions = this.game.add.group();
            instructions.fixedToCamera = true;
            instructions.scale.set(2);

            // instruction container
            instructions.create(100-32, 40 - 22, 'uiAtlas', 'containerBorderRadiusBegin.png');
            let content = this.add.tileSprite(100, 40 - 22, 200, 64, 'uiAtlas', 'containerBorderRadius.png');
            instructions.add(content);
            instructions.create(100 + 200, 40 - 22, 'uiAtlas', 'containerBorderRadiusEnd.png');

            let text = this.textLine(0,0,'SELECT', 20, content.width)
            text.x = Math.floor(content.x + content.width / 2)*2;
            text.y = Math.floor(content.y - 10 + content.height / 2)*2;
            text.anchor.set(0.5);
            text.fixedToCamera = true;

            let text = this.textLine(0,0,'Choose (ENTER)', 14, content.width);
            text.x = Math.floor(content.x + content.width / 2)*2;
            text.y = Math.floor(content.y + 15 + content.height / 2)*2;
            text.anchor.set(0.5);
            text.fixedToCamera = true;

            instructions.create(100, 45, 'uiAtlas', 'arrowLeft.png');
            instructions.add(this.textLine (100 + 11 + 5,40, 'A'));

            instructions.create(300 - 11, 45, 'uiAtlas', 'arrowRight.png');
            instructions.add(this.textLine (300 - 11 - 11 - 5,40, 'D'));

            // submit button
            this.game.input.keyboard.removeKeyCapture(13);
            let submit = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            submit.onDown.add(function() {
                
                let message = {
                    type: MessageType.CHARACTER_SELECTION,
                    character: CharacterSelecter.characterList[this.pointer.pos].name
                };

                this.game.ws.send(message);
            }, this);

            this.game.ws.continueToArenaSelection = this.continueToArenaSelection.bind(this);

        }

        private textLine (x,y, text:string, size:string, wordWrapWidth:number) {
            let font = 12;
            if (size) {
                font = size;
            }

            let text = this.game.add.text(x,y,text,{font:font+"px Arial",fill:"#ffffff",
                wordWrap: true, wordWrapWidth: wordWrapWidth, align: "center"});
            text.stroke = '#000000';
            text.strokeThickness = 2;
            return text;
        }

        private continueToArenaSelection(message:any) {
            this.game.state.start('ArenaSelection', true, false, {
                name: this.playerName,
                character: CharacterSelecter.characterList[this.pointer.pos].name
            });
        } 
    }
}
