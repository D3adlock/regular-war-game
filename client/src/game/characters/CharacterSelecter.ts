/// <reference path="../characters/Link.ts" />

module Rwg {

    export class CharacterSelecter {

    	public static getCharacterArgs(characterName:string) {
    		switch(characterName) {
    			case 'LINK':
    				return new Link();
    				break;
    			default:
    				return new Link();
    		}
    	}

    	public static characterList = 
        [
            {name:'LINK', desc: "Link \nA stolen character I wanted to use"},
            {name:'LINK', desc: "Link \nA stolen character I wanted to use"},
            {name:'LINK', desc: "Link \nA stolen character I wanted to use"},
            {name:'LINK', desc: "Link \nA stolen character I wanted to use"},
            {name:'LINK', desc: "Link \nA stolen character I wanted to use"},
            {name:'LINK', desc: "Link \nA stolen character I wanted to use"}
        ]

    }
}