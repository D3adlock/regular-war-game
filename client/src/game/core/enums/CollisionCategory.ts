module Rwg {
    export enum CollisionCategory {
    	WALL = 			 parseInt('00010', 2 ),
    	CHAR = 	    	 parseInt('01000', 2 ),
    	USER_PLAYER =    parseInt('00100', 2 ),
    	ATTACK = 		 parseInt('10000', 2 )
    };
}