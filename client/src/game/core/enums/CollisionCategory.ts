module Rwg {
    export enum CollisionCategory {
    	WALL = 			 		parseInt('000010', 2 ),
    	TEAM_ONE_HITBOX =  	 	parseInt('001000', 2 ),
    	TEAM_ZERO_HITBOX =      parseInt('000100', 2 ),
    	ATTACK = 		 		parseInt('010000', 2 ),
    	CHAR_BODY =      		parseInt('100000', 2 )
    };
}