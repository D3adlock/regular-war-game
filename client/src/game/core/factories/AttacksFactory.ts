/// <reference path="../super/BaseChar.ts" />

module Rwg {

    export class AttackFactory {
    
    	public static getAttack(args:any) {

    		if (!(args.type && args.name && args.damage && args.range)) {
    			throw new Error('Error creating character - missing arguments ' +
    				'args.game && args.atlasName && args.framesPerMovement && args.name');
    		}

    		CharFactory.checkFrames(args.game, args.atlasName, args.framesPerMovement);
    		
    		let newChar = new BaseChar(args.game, args.name, args.atlasName, args.framesPerMovement);

    		if (args.controlable) {
    			(new MovementControlProvider(300)).provide(newChar);
    		}

    		if (args.scale) {
    			newChar.scale.setTo(args.scale);
    		}

    		if (args.canAttack) {
    			AttackEnableProvider.provide(newChar);
    		}

    		if (args.attacks) {
    			
    		}

    		return newChar;
    	}

        private static checkFrames(game: Phaser.Game, atlasName:string, framesPerMovement:number) {

            let baseFrames = ['standDown.png','standUp.png','standLeft.png','standRight.png'];

            for(let i=1;i<=framesPerMovement;i++) {
                baseFrames.push('moveRight'+i+'.png');
                baseFrames.push('moveLeft'+i+'.png');
                baseFrames.push('moveUp'+i+'.png');
                baseFrames.push('moveDown'+i+'.png');
            }

            let missingFrames = [];

            for(let i=0;i<baseFrames.length;i++) {
                if (!game.cache.getFrameByName(atlasName, baseFrames[i])) {
                    missingFrames.push(atlasName+'/'+baseFrames[i]);
                }
            }

            if (missingFrames.length > 0) {
            	throw new Error('Error creating character - missing frames ['+ missingFrames +']');
            }
        }

    }
}