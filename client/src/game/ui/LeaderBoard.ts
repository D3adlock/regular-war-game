module Rwg {

    export class LeaderBoard {

        public players:any;
        public playerListText:any;

    	constructor(game:any) {

            this.game = game;

            this.players = {};

            this.container = game.add.graphics(600, 10);
            this.container.beginFill(0x000000);
            this.container.alpha = 0.7;
            this.container.drawRect(0, 0, 190, 500);
            this.container.fixedToCamera = true;

        	this.style = { font: "16px Arial", fill: "#ffffff", align: "center"};

            this.tittle = game.add.text(10, 10, 'PLAYERS:', this.style);
            this.container.addChild(this.tittle);

            this.players[game.userPlayer.playerId] = 0;
            this.playerListText = [];
            this.display();
    	}

    	public addPlayer(player:string) {
            this.players[player] = 0;
    	}

        public updatePlayerScore(player:string, score) {
            this.players[player]++;
        }

        public display() {

            for(let i = 0; i < this.playerListText.length; i++) {
                this.container.removeChild(this.playerListText[i]);
            }

            this.playerListText = [];


            let temp = [];
            for(a in this.players){
                temp.push([a,this.players[a]])
            }
            temp.sort(function(a,b){return a[1] - b[1]});
            temp.reverse();

            let y = 20;
            
            for(let i = 0; i < temp.length; i++) {
                let line = this.game.add.text(10, 40 + i*y, (i+1) + '. ' + temp[i][0] + " : " + temp[i][1], this.style);
                this.playerListText.push(line);
                this.container.addChild(line);
            }
        }
    }
}