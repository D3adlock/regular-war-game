module Rwg {

    export class SkillContainer {

        private skillContainer:any;
        private game:any;
        private x:number;
        private y:number;
        private skillIcons:any;
        private castingBar:any;
        private castingBarContent:any;
        private selectedSkillMarginSprite:any;
        private currentSkillInSkillBar:any;

        private player;

    	constructor(game:any) {
            this.game = game;
            this.player = game.state.getCurrentState().player;
            this.skillContainer = this.game.add.group();
            this.x = Math.floor(this.game.width/2) - 111;
            this.y = this.game.height - 44;
            this.skillIcons = {};

            let index = this.drawSkillIcons(this.player.attacks, 0);
            this.drawSkillIcons(this.player.skills, index);
            this.drawSkillBarAndSelectedSkillTarget();
            this.drawCastingBar();
            this.addChangeTargetWhenSkillSelected();
            this.addCoolDownAnimation();

            this.addChangeActivationKeyMethod()
        }

        private drawSkillIcons(skillsOrAttacks:any, startIndex:number) {

            let i = startIndex;
            for (let key in skillsOrAttacks){
                // only if skill has controles
                if (skillsOrAttacks[key].select != undefined) {
                    let x = this.x + 6;
                    let y = this.y + 6;
                    if (i > 0) {  x += (32 + 4) * i; }
                    this.skillIcons[key] = this.skillContainer.create(x, y, 'uiAtlas', skillsOrAttacks[key].icon);
                    this.skillIcons[key].coolDownCover = this.drawSkillCoolDownCovers(x,y);         
                    i++;
                }
            }

            return i;
    	}

        private drawSkillCoolDownCovers(x,y) {

            let clearCover = this.game.add.graphics(x, y);
            clearCover.alpha = 0.5;
            clearCover.beginFill(0xffffff);
            clearCover.drawRect(0,0, 32, 32);
            clearCover.visible = false;

            let cover = this.game.add.graphics(x+16,y+16);
            cover.visible = false;
            cover.alpha = 0.9;
            cover.beginFill(0x000000);
            cover.arc(0, 0, 24, this.game.math.degToRad(15), this.game.math.degToRad(360), true);
            cover.endFill();

            let coverMask = this.game.add.graphics(x, y);
            coverMask.beginFill(0xffffff);
            coverMask.drawRect(0,0, 32, 32);
            cover.mask = coverMask;

            this.skillContainer.addChild(clearCover);
            this.skillContainer.addChild(cover);
            this.skillContainer.addChild(coverMask);

            return {cover:cover, clearCover:clearCover};
        }

        private drawSkillBarAndSelectedSkillTarget() {

            this.skillContainer.create(this.x, this.y, 'uiAtlas', 'emptySkillContainer.png');
            this.selectedSkillMarginSprite = this.skillContainer.create(this.x, this.y, 'uiAtlas', 'selectedSkill.png');
            this.selectedSkillMarginSprite.visible = false;
        }

        private drawCastingBar() {

            let x = Math.floor(this.game.width/2) - 165;
            let y = Math.floor(this.game.height * 0.9) - 8;

            this.castingBarContent = this.game.add.tileSprite(x+3, y+3, 325, 11, 'uiAtlas', 'cast.png');
            this.skillContainer.addChild(this.castingBarContent);   
            this.castingBarContent.visible = false;

            this.castingBar = this.skillContainer.create(x, y, 'uiAtlas', 'emptyBar.png');
            this.castingBar.visible = false;
        } 

        private addChangeTargetWhenSkillSelected() {
            for (let key in this.skillIcons){
                    
                let selectedSkillMarginSprite = this.selectedSkillMarginSprite;
                let x = this.skillIcons[key].x;
                let y = this.skillIcons[key].y;
                let skill = null;
                if (this.player.attacks[key]) {
                    skill = this.player.attacks[key];
                } else if(this.player.skills[key]){
                    skill = this.player.skills[key];
                }

                let castingBar = this.castingBar;
                let oldSkillSelectedFunction = skill.select;

                let setCurrentSkillInSkillBar = function(skill:any) {
                    this.currentSkillInSkillBar = skill;
                }.bind(this);

                let newSkillSelectedFunction = function() {
                    if (!castingBar.visible) {
                        setCurrentSkillInSkillBar(skill) // callback to select the currentSkillInSkillBar
                        oldSkillSelectedFunction();
                        selectedSkillMarginSprite.x = x;
                        selectedSkillMarginSprite.y = y;
                        selectedSkillMarginSprite.visible = true;
                    }
                };

                skill.select = newSkillSelectedFunction.bind(this.player);

                let activationKey = this.game.input.keyboard.addKey(skill.activationKey);
                activationKey.onDown.add(skill.select, this.player);

                // adds the char label to the skill
                let xCharPos = this.skillIcons[key].x + 2;
                let yCharPos = this.skillIcons[key].y;
                let keyLabel = this.game.add.text(xCharPos,yCharPos,String.fromCharCode(skill.activationKey),
                    {font:"bold 12px Arial",fill:"#ffffff"});
                keyLabel.stroke = '#000000';
                keyLabel.strokeThickness = 4;
                this.skillContainer.add(keyLabel);
                this.skillIcons[key].keyLabel = keyLabel;
            }
        }

        private changeSkillKey(char:number) {
            if (this.currentSkillInSkillBar) {
                let activationKey = this.game.input.keyboard.addKey(this.currentSkillInSkillBar.activationKey);
                activationKey.onDown.removeAll();
                
                this.currentSkillInSkillBar.activationKey = char;
                activationKey = this.game.input.keyboard.addKey(this.currentSkillInSkillBar.activationKey);
                activationKey.onDown.add(this.currentSkillInSkillBar.select.bind(this.player), this.player);

                // adds the char label to the skill
                this.skillIcons[this.currentSkillInSkillBar.name].keyLabel.text = String.fromCharCode(char);
            }
        }

        private addChangeActivationKeyMethod() {

            let forbiden = [Phaser.KeyCode.A,Phaser.KeyCode.W,Phaser.KeyCode.S,Phaser.KeyCode.D, Phaser.KeyCode.L];
            let l = this.game.input.keyboard.addKey(Phaser.KeyCode.L);

            l.onHoldCallback = function() {
                if (forbiden.indexOf(this.game.input.keyboard.event.which) == -1) {
                    this.changeSkillKey(this.game.input.keyboard.event.which);
                }
            }.bind(this);
        }

        private addCoolDownAnimation() {
            for (let key in this.skillIcons){

                let skill = null;
                if (this.player.attacks[key]) {
                    skill = this.player.attacks[key];
                } else if (this.player.skills[key]) {
                    skill = this.player.skills[key];
                }

                let x = this.skillIcons[key].x;
                let y = this.skillIcons[key].y;
                let coolDownCover = this.skillIcons[key].coolDownCover;

                // for the casting bar
                let castingBar = this.castingBar;
                let castingBarContent = this.castingBarContent;

                skill.additionalOnTriggerCallBack = function(actionTime) {

                    let timer = this.game.time.create(false);
                    let elapsed = 0;
                    let angle = 0;
                    let width = 0;

                    coolDownCover.cover.visible = true;
                    coolDownCover.clearCover.visible = true;
                    
                    // if requieres casting bar
                    if (skill.castingSpeed) {
                        castingBarContent.width = 0;
                        castingBarContent.visible = true;
                        castingBar.visible = true;
                    } 

                    timer.loop(50, function() {
                        elapsed += 50;

                        // for the skill icon
                        angle = Math.floor((elapsed * 360)/skill.coolDown);
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
                            castingBarContent.width = Math.floor((elapsed * 325)/skill.castingSpeed);

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
                }.bind(this.player);
            }
        }
    }
}