module Rwg {

    export class MiniLifeBar {

    	constructor(game:any, allyTeam:boolean) {

            this.mark = game.add.graphics(0,0);
            this.mark.beginFill(0x000000);
            this.mark.drawRect(-30, 26, 60, 10);

            this.life = game.add.graphics(0,0);
            if (allyTeam) {
                this.life.beginFill(0x00ff00);
            } else {
                this.life.beginFill(0xff0000);
            }
            
            this.life.drawRect(-28, 28, 56, 6);

            this.mark.addChild(this.life);
    	}

        public setPosition(position:any) {
            this.mark.position = position;
        }

    	public updateLifeBar(maxHp:number,currentHp:number) {

    		// this.hipointsDisplay.text = currentHp + '/' + maxHp;
    		let width = (currentHp*56)/maxHp;
    		this.life.width = width;
    	}
    }
}