function Player(connection) {
	this.connection = connection;
	this.color = Math.random()*0xFFFFFF;
	this.position = {};
	this.position.x = 300;
	this.position.y = 300;
};

Player.prototype.setPlayerId = function(playerId) {
	this.playerId = playerId;
}

exports.new = function (connection) {
	return new Player(connection);
};