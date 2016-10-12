"use strict";

process.title = 'game-server-websocket-and-http';

var webSocketsServerPort = 1337;
var webSocketServer = require('websocket').server;
var http = require('http');

var Player = require('./lib/game-core/player');

var players = {};

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

    //this code happends once connection is stablished
    var player = Player.new(request.accept(null, request.origin));

    player.connection.on('message', function(message) {
        
        var message = JSON.parse(message.utf8Data);

        switch(message.type) {
            // request enter is 0
            case 0:
                if (players[message.name] == null) {

                    player.setPlayerId(message.name);
                    players[message.name] = player;
                    
                    var playersScore = [];
                    for (var key in players) {
                        playersScore.push({name: key, score: players[key].score} );
                    }

                    players[message.name].connection.send(JSON.stringify({
                        name: message.name,
                        x: player.position.x,
                        y: player.position.y, 
                        type: 1,
                        playersScore: playersScore
                    }));
                } else {
                    player.connection.send(JSON.stringify({error: 'name already exist', type: 'requestEnter'}));
                }
                break;
            case 8:
                if (message.killed) {
                    players[message.hittedBy].score++;
                }

                var newMessage =  {
                    type: 8,
                    name: message.name,
                    hittedBy: message.hittedBy,
                    killed: message.killed,
                    currentHP: message.currentHP,
                    score: players[message.hittedBy].score
                };
                for (var key in players) {
                    players[key].connection.send(JSON.stringify(newMessage));
                }
                break;
            default:
                for (var key in players) {
                    players[key].connection.send(JSON.stringify(message));
                }
        }
    });

    player.connection.on('close', function(connection) {
        for (var key in players) {
            players[key].connection.send(JSON.stringify({playerId: player.playerId, type: 'removePlayer'}));
            delete players[player.playerId];
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

