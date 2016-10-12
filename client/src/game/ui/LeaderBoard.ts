module Rwg {

    export class LeaderBoard {

        public board:any;
        public players:any;
        private game:any;

    	constructor(game:any, initPlayersScore:any) {
            this.game = game;
    		this.board = this.game.add.group();
            this.board.visible = false;
            this.players = initPlayersScore;
            this.displayLeaderBoard();
            this.generateDisplayBoardMethod();
        }

        public displayLeaderBoard() {
            this.sort();
            this.board.removeAll();
            this.drawBoard();
        }

        public addPlayer(player:any){
            this.players.push({name:player.name, character:player.character ,kill:0,assist:0;death:0, score: 0});
            this.sort();
            this.board.removeAll();
            this.drawBoard();

        }

        public exists(playerName:string){
            for (var i = this.players.length - 1; i >= 0; i--) {
                if (this.players[i].name == playerName) {
                    return true;
                }
            };
            return false;
        }

        public updateBoardInfoKill(name, kill) {

            let found = false;
            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i].name == name) {
                    this.players[i].kill = kill;
                    this.players[i].score = (this.players[i].kill*10) + (this.players[i].assist*0.5); // + (this.players[i].death*(-1));
                    found = true;
                }
            }

            this.sort();
            this.board.removeAll();
            this.drawBoard();
        }

        public updateBoardInfoAssist(name, assist) {

            let found = false;
            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i].name == name) {
                    this.players[i].assist = assist;
                    this.players[i].score = (this.players[i].kill*10) + (this.players[i].assist*5); //+ (this.players[i].death*(-1));
                    found = true;
                }
            }

            this.sort();
            this.board.removeAll();
            this.drawBoard();
        }

        public updateBoardInfoDeath(name, death) {

            let found = false;
            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i].name == name) {
                    this.players[i].death = death;
                    this.players[i].score = (this.players[i].kill*10) + (this.players[i].assist*5); //+ (this.players[i].death*(-1));
                    found = true;
                }
            }

            this.sort();
            this.board.removeAll();
            this.drawBoard();
        }

        private generateDisplayBoardMethod() {
            let shift = this.game.input.keyboard.addKey(Phaser.KeyCode.SHIFT);
            shift.onDown.add(function() {
                this.board.visible = true;
            }, this);
            shift.onUp.add(function() {
                this.board.visible = false;
            }, this);
        }

        private drawBoard() {
            let x = 540;
            let y = 20;

            // top leader board sprite
            this.board.create(x,y, 'uiAtlas', 'leaderBoardTop.png');
            y += 6;

            // leader board content
            let height = this.getLeaderBoardContent();
            this.boardContainer = this.game.add.tileSprite(x, y, 235,height, 'uiAtlas', 'leaderBoardSegment.png');
            this.board.add(this.boardContainer);

            // leader board tile
            let title = this.game.add.text(x +20,y +2 ,'Leader Board',
                    {font:"bold 16px Arial",fill:"#ffffff"});
            title.stroke = '#000000';
            title.strokeThickness = 4;
            this.board.add(title);
            y += title.height + 4; //33 px

            // content
            for (let i = 0; i < this.players.length; i++) {
                y += this.addLine((i+1) + '. ' + this.players[i].name, this.players[i],x, y);
            }

            // leaderBoardBottom
            this.board.create(x,height + 26, 'uiAtlas', 'leaderBoardBottom.png');
        }

        private addLine(name, player, x, y) {
            let line = this.game.add.text(x +20,y, name + ' : ' + player.kill + '/' + player.assist + '/' + player.death + ' score: ' + player.score,{font:'14px Arial',fill:"#ffffff"});
            line.stroke = '#000000';
            line.strokeThickness = 3;
            this.board.add(line);
            return line.height +1; // 26 px
        }

        private getLeaderBoardContent() {
            let height = 33;
            height = 26 * (this.players.length+1);
            return height;
        }

        private sort() {
            this.players.sort(function(a, b) {
                return b.score - a.score;
            });
        }
    }
}