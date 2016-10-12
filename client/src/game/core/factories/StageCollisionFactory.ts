/// <reference path="../base/BaseChar.ts" />
/// <reference path="../enums/CollisionCategory.ts" />

module Rwg {

    export class StageCollisionFactory {

        constructor(args:any) {
        }

        public getCollisionObjects(game:Phaser.Game, objectsList:any, debug:boolean) {

            for (let i= 0; i < objectsList.length; i++) {
                //creates the obstacules
                let object = objectsList[i];

                let sprite = game.add.sprite(object.x,object.y);  
                game.physics.box2d.enable(sprite);
                
                let vertices = [];
                for (let j = 1; j < object.polyline.length; j++) {
                    vertices.push(object.polyline[j][0]);
                    vertices.push(object.polyline[j][1]);
                }

                sprite.body.setPolygon(vertices);
                sprite.body.static = true;
                sprite.body.setCollisionCategory(CollisionCategory.WALL);

                // render methods
                if (debug) {
                    game.renderMethods['debugTheObject'+ object.name] = function() {
                        game.debug.body(sprite);
                    }.bind(this);
                }
            }
        }
    }
}
