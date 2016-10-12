/// <reference path="../core/enums/MessageType.ts" />
/// <reference path="../arenas/ArenaSelecter.ts" />

module Rwg {

    export class ArenaSelection extends Phaser.State {

        private arena:string;
        private playerName:string;
        private character:string;
        private selectedArena:string;
        private selectedTeam:number;

        init(message:any){
            this.playerName = message.name;
            this.character = message.character;
        }

        create() {

            let background = this.game.add.tileSprite(0,0,800, 600,'background');
            background.fixedToCamera = true;

            let teamselectorGroup = this.game.add.group();
            teamselectorGroup.fixToCamera = true;
            teamselectorGroup.scale.set(2);

            let xpos = 145;
            let ypos = 25;
            teamselectorGroup.create(xpos, ypos, 'uiAtlas', 'team_select_begin.png');
            let team1 = this.add.tileSprite(xpos + 32, ypos, 60, 24, 'uiAtlas', 'team_select.png');
            teamselectorGroup.add(team1);
            teamselectorGroup.create(xpos + 32 + 60, ypos, 'uiAtlas', 'team_select_end_2.png');
            let orbTeam1 = teamselectorGroup.create(xpos + 5, ypos + 5 , 'uiAtlas', 'orb.png');
            this.textLine((xpos + 45)*2, (ypos + 7)*2 , 'TEAM 0 (W)', 15, team1);

            ypos = 250;
            teamselectorGroup.create(xpos, ypos, 'uiAtlas', 'team_select_begin.png');
            let team2 = this.add.tileSprite(xpos + 32, ypos, 60, 24, 'uiAtlas', 'team_select.png');
            teamselectorGroup.add(team2);
            teamselectorGroup.create(xpos + 32 + 60, ypos, 'uiAtlas', 'team_select_end_2.png');
            let orbTeam2 = teamselectorGroup.create(xpos + 5, ypos + 5 , 'uiAtlas', 'orb.png');
            this.textLine((xpos + 45)*2, (ypos + 7)*2 , 'TEAM 1 (S)', 15, team1);


            // movement cursor UP
            let up = this.game.input.keyboard.addKey(Phaser.KeyCode.W);
            up.onDown.add(function() {
                orbTeam1.frameName = 'red_orb.png';
                orbTeam2.frameName = 'orb.png';
                this.selectedTeam = 0;
            }, this);

            // Down
            let down = this.game.input.keyboard.addKey(Phaser.KeyCode.S);
            down.onDown.add(function() {
                orbTeam2.frameName = 'red_orb.png';
                orbTeam1.frameName = 'orb.png';
                this.selectedTeam = 1;
            }, this);

            this.addArenaContainer(ArenaSelecter.arenaList[0], xpos + 25, 80);

            let index = 0;

            // movement cursor left
            let left = this.game.input.keyboard.addKey(Phaser.KeyCode.A);
            left.onDown.add(function() {
                if (index > 0) {
                    index--;
                    this.icon = ArenaSelecter.arenaList[index].icon;
                    this.description.text = ArenaSelecter.arenaList[index].desc;
                    this.selectedArena = ArenaSelecter.arenaList[index].name;
                } 
            }, this);

            // right
            let right = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
            right.onDown.add(function() {
                if (index < ArenaSelecter.arenaList.length) {
                    index++;
                    this.icon = ArenaSelecter.arenaList[index].icon;
                    this.description.text = ArenaSelecter.arenaList[index].desc;
                    this.selectedArena = ArenaSelecter.arenaList[index].name;
                } 
            }, this);

            this.selectedTeam = null;
            this.selectedArena = ArenaSelecter.arenaList[0].name;

            // submit button
            this.game.input.keyboard.removeKeyCapture(13);
            let submit = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
            submit.onDown.add(function() {
                if (this.selectedTeam != null) {
                    let message = {
                        type: MessageType.ARENA_SELECTION,
                        arena: this.selectedArena,
                        team:this.selectedTeam
                    };

                    this.game.ws.send(message);
                }
            }, this);


            this.game.ws.initArena = this.initArena.bind(this);
        }

        private initArena(message:any) {
            this.game.state.start(this.selectedArena, true, false, {
                name: this.playerName,
                character: this.character,
                team: this.selectedTeam,
                playerScores: message.playerScores
            });
        }

        private addArenaContainer(element:any, x:number, y:number) {

            this.icon = this.game.add.sprite((x)*2,(y)*2, 'arenaIcons', element.icon);

            let container = this.game.add.group();
            container.scale.set(2);
            container.create(x, y, 'uiAtlas', 'frame_top_left.png');
            container.create(x+32, y, 'uiAtlas', 'frame_top_right.png');
            container.create(x, y+32, 'uiAtlas', 'frame_bottom_left.png');
            container.create(x+32, y+32, 'uiAtlas', 'frame_bottom_right.png');

            // description Container
            let descriptionContainer = this.game.add.group();
            descriptionContainer.fixedToCamera = true;
            descriptionContainer.scale.set(2);
            descriptionContainer.create(x - 50, y + 80, 'uiAtlas', 'containerBorderRadiusBegin.png');
            let content = this.add.tileSprite(x +32 - 50, y + 80, 100, 64, 'uiAtlas', 'containerBorderRadius.png');
            descriptionContainer.add(content);
            descriptionContainer.create(x + 32 + 100 - 50, y + 80, 'uiAtlas', 'containerBorderRadiusEnd.png');

            this.description = this.textLine((x - 50 + 32 + 25)*2,(y + 80 + 14)*2, element.desc, 15, content);
        }

        private textLine(x,y, text:string, size:string, wordWrapWidth:number) {
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
    }
}
