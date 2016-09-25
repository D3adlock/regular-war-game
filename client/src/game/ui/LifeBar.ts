module Rwg {

    export class LifeBar extends Phaser.Graphics {

    	constructor(game:any) {
    		super(game, 0, 0);

            this.life = this.game.add.graphics(250, 560);
            this.life.beginFill(0xff0000);
            this.life.drawRect(0, 0, 300, 30);
            this.life.fixedToCamera = true;

            this.leftMark = this.game.add.graphics(250, 560);
            this.leftMark.beginFill(0x000000);
            this.leftMark.drawRect(0, 0, 5, 30);
            this.leftMark.fixedToCamera = true;
			
			this.rightMark = this.game.add.graphics(545, 560);
            this.rightMark.beginFill(0x000000);
            this.rightMark.drawRect(0, 0, 5, 30);
            this.rightMark.fixedToCamera = true;

			this.topMark = this.game.add.graphics(250, 560);
            this.topMark.beginFill(0x000000);
            this.topMark.drawRect(0, 0, 300, 5);
            this.topMark.fixedToCamera = true;

			this.bottomMark = this.game.add.graphics(250, 585);
            this.bottomMark.beginFill(0x000000);
            this.bottomMark.drawRect(0, 0, 300, 5);
            this.bottomMark.fixedToCamera = true;


        	var style = { font: "16px Arial", fill: "#ffffff", align: "center"};
            this.hipointsDisplay = this.game.add.text(400, 575, 'HP : ', style);
            this.hipointsDisplay.anchor.set(0.5,0.4)
            this.hipointsDisplay.fixedToCamera = true;
    	}

    	public updateLifeBar(maxHp:number,currentHp:number) {

    		this.hipointsDisplay.text = currentHp + '/' + maxHp;
    		let width = (currentHp*300)/maxHp;
    		this.life.width = width;
    	}
    }
}