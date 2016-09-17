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
            case 'requestEnter':
                if (players[message.playerId] == null) {
                    
                    player.setPlayerId(message.playerId);
                    players[message.playerId] = player;
                    
                    player.connection.send(JSON.stringify(
                    {
                        playerId: message.playerId,
                        fightType: message.fightType,
                        team: message.team,
                        color: player.color,
                        x: player.position.x,
                        y: player.position.y, 
                        type: 'init'
                    }));
                } else {
                    player.connection.send(JSON.stringify({error: 'name already exist', type: 'requestEnter'}));
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

