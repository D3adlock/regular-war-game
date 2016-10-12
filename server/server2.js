"use strict";

process.title = 'game-server-websocket-and-http';

var webSocketsServerPort = 1337;
var webSocketServer = require('websocket').server;
var http = require('http');

var arenas = {};
var arenasInfo = {};

arenas['ForestTown'] = {};

arenasInfo['ForestTown'] = {};
arenasInfo['ForestTown'].condition = 'SCORE';
arenasInfo['ForestTown'].max_score = 50;

var players = {};

/**
 * Util methods
 */

 var getPlayerScores = function(arena) {
    var playersScore = [];

    for (var key in arenas[arena]) {
        playersScore.push({
            name: key, 
            kill: arenas[arena][key].kill,
            assist: arenas[arena][key].assist, 
            death:arenas[arena][key].death,
            character: arenas[arena][key].character,
            score: 0 // this value is calculated in the client so it is irrelevant in the table initialization
        });
    }
    return playersScore;
 }

var updatePlayersButMe = function(arena, me, message) {
    for (var key in arenas[arena]) {
        if (me != key) {
            arenas[arena][key].connection.send(JSON.stringify(message));
        }
    }
 }

 var updatePlayers = function(arena, message) {
    for (var key in arenas[arena]) {
        arenas[arena][key].connection.send(JSON.stringify(message));
    }
 }

var getPlayerInfo = function(arena, playerName) {
    return {
        character: arenas[arena][playerName].character,
        team: arenas[arena][playerName].team,
        kill: arenas[arena][playerName].kill,
        assist: arenas[arena][playerName].assist,
        death: arenas[arena][playerName].death,
        x: arenas[arena][playerName].pos.x,
        y: arenas[arena][playerName].pos.y
    }
}

var updatePlayerPosition = function(message) {
    players[message.name].pos.x = message.x;
    players[message.name].pos.y = message.y;
}

var checkGameOver = function(arena, message, assist) {

    var score = (players[message.hittedBy].kill*10) + (players[message.hittedBy].assist*0.5);

    if (score >= arenasInfo[players[message.hittedBy].arena].max_score) {
        updatePlayers(arena, {
            type: 1, // GAME_OVER = 1
            winner: message.hittedBy,
            kill: players[message.hittedBy].kill,
            assist:  assist,
            death:  players[message.name].death
        });
        return true;
    }
    return false;
}

/**
 * HTTP server
 */
var server = http.createServer(function(request, response) {});
server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({httpServer: server});
wsServer.on('request', function(request) {

    var player = request.accept(null, request.origin);
    // this name var is for handle deletions
    var name = '';

    player.on('message', function(message) {
        
        var message = JSON.parse(message.utf8Data);

        switch(message.type) {
            case 9: // NAME_SELECTION = 9
                if (players[message.name] == null) {

                    player.name = message.name;
                    name = message.name;
                    players[message.name] = {};
                    players[message.name].connection = player;
                    players[message.name].name = message.name

                    player.send(JSON.stringify({
                        type: 9,
                        nameAccepted: true
                    }));
                } else {
                    player.send(JSON.stringify({
                        type: 9,
                        nameAccepted: false,
                        error: 'name already taken'
                    }));
                }
                break;
            case 10: // CHARACTER_SELECTION = 10
                players[player.name].character = message.character;
                player.send(JSON.stringify({
                    type: 10,
                    selectedCharacter: players[player.name].character
                }));
                break;
            case 11: // ARENA_SELECTION = 11
                // initiate the new player in the arena with its corresponding stats
                players[player.name].arena = message.arena;
                players[player.name].team = message.team;
                players[player.name].kill = 0;
                players[player.name].assist = 0;
                players[player.name].death = 0;
                players[player.name].pos = {x:0,y:0};
                arenas[players[player.name].arena][player.name] = players[player.name];

                // send the list of the current players
                player.send(JSON.stringify({
                    type: 11,
                    playerScores: getPlayerScores(players[player.name].arena)
                }));
                
                // send the new player info to the other players
                updatePlayersButMe(players[player.name].arena, player.name,{
                    type: 3, // NEW_PLAYER = 3
                    name: player.name,
                    character: players[player.name].character,
                    team: players[player.name].team,
                    kill: players[player.name].kill,
                    assist: players[player.name].assist,
                    death: players[player.name].death,
                    x: players[player.name].pos.x,
                    y: players[player.name].pos.y
                });
                break;
            case 2: // REQUEST_PLAYER_INFO = 2
                var info = getPlayerInfo(players[player.name].arena, message.name);
                player.send(JSON.stringify({
                    type: 3, // NEW_PLAYER = 3
                    name: message.name,
                    character: info.character,
                    team: info.team,
                    kill: info.kill,
                    assist: info.assist,
                    death: info.death,
                    x: info.x,
                    y: info.y
                }));
                break;
            case 8: // DAMAGE=8

                if (message.killed) {
                    // if it is a death, it updates the score for each involved player
                    // the one who killed
                    players[message.hittedBy].kill++;
                    message.kill = players[message.hittedBy].kill
                    
                    // the one who death
                    players[message.name].death++;
                    message.death = players[message.name].death;

                    // the ones who assisted in the kill
                    var assist = [];
                    for (var i = 0; i < message.assist.length; i++) {
                        assist.push({name:message.assist[i], assist: players[message.assist[i]].assist++});
                    }
                    message.assist = assist;

                    // sends the message if the game is over
                    if (checkGameOver(players[player.name].arena, message)) {break;}
                }

                // just send the messages with the scores
                updatePlayers(players[player.name].arena, message);
                break;
            case 4: // MOVE = 4
                updatePlayerPosition(message);
                updatePlayers(players[player.name].arena, message);
                break;
            default: // players comunitacion
                updatePlayers(players[player.name].arena, message);
        }
    });

    player.on('close', function(connection) {
        for (var key in players) {
            players[key].connection.send(JSON.stringify({
                name: player.name, 
                // PLAYER_LEFT=12
                type: 12
            }));
        }
        
        // removes the player from the arena and the list of players
        if (players[name]) {
            if (players[name].arena) {
                if (arenas[players[name].arena][name]) {
                    delete arenas[players[name].arena][name];
                }
            }
            delete players[name];
        }
    });
});

/**
 * HTTP server for hosting index
 */
var express = require('express');
var app = express();
//use the public folder
app.use(express.static('public'));
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('http server for handling connections to http://%s:%s', host, port);
});

