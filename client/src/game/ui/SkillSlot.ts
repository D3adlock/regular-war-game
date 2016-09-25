module Rwg {

    export class SkillSlot {

        public coolDown:number;
        public iconName:string;
        private size = 60;
        private refreshTime = 0;
        private refreshRate = 120;

        constructor(game:any, player:any, index:number) {

            this.game = game;
            this.player = player;

            if(this.player.isUserPlayer) {         
                this.slot = this.game.add.graphics(250 + (this.size * index), 500);
                this.slot.beginFill(0x000000);
                this.slot.drawRect(0, 0, this.size, this.size);
                this.slot.fixedToCamera = true;
            }
        }

        public render() {

            if(this.player.isUserPlayer) {
                this.slotBlackBackground = this.game.add.graphics(5,5);
                this.slotBlackBackground.beginFill(0x000000);
                this.slotBlackBackground.drawRect(0, 0, 50, 50);
                this.slot.addChild(this.slotBlackBackground);

                this.icon = this.game.add.sprite(5,5, this.iconName + 'Icon');
                this.icon.inputEnabled = true;
                this.icon.selected = false;
                this.slot.addChild(this.icon);

                this.slotCover = this.game.add.graphics(5,5);
                this.slotCover.alpha = 0.8;
                this.slotCover.beginFill(0x000000);
                this.slotCover.width = 0;
                this.slotCover.drawRect(0, 0, 50, 50);
                this.slot.addChild(this.slotCover);

                this.widthDecrement = 50/(this.coolDown/this.refreshRate);

                this.player.updateMethods[this.iconName + 'resetAnimation'] = function() {
                    if(this.slotCover.width > 0) {
                        if (this.refreshTime < this.game.time.now) {
                            
                            this.slotCover.width -= this.widthDecrement;
                            if (this.slotCover.width < 0) {this.slotCover.width = 0}; 

                            this.refreshTime = this.game.time.now + this.refreshRate;
                        }
                    }
                }.bind(this);
            }
        }

        public mark() {
            if(this.player.isUserPlayer) {         
                for(key in this.player.skillSlots) {
                    this.player.skillSlots[key].unMark();
                }

                this.slot.fillColor = 0XF0FFFF;
                this.slot.drawRect(0, 0, this.size, this.size);
            }
        }

        public unMark() {
            if(this.player.isUserPlayer) {         
                this.slot.fillColor = 0X000000;
                this.slot.drawRect(0, 0, this.size, this.size);
            }
        }

        public use() {
            if(this.player.isUserPlayer) {
                this.refreshTime = this.game.time.now + this.refreshRate;
                this.slotCover.width = 50;
            }
        }



    }
}