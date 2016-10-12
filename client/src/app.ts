/// <reference path="game/Game.ts" />
/// <reference path="game/serverconn/WSConnection.ts" />

window.onload = () => {

	var ws = new Rwg.WSConnection('ws://localhost:1337');
	ws.connect();
	
    var game = new Rwg.Game(ws);
};
