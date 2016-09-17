/// <reference path="game/Game.ts" />
/// <reference path="game/serverconn/WSConnection.ts" />

window.onload = () => {

	var ws = new Rwg.WSConnection('ws://201.214.74.5:1337');
	ws.connect();
	
    var game = new Rwg.Game(ws);
};
