/// <reference path="../core/enums/MessageType.ts" />

module Rwg {
	export class WSConnection {

		private conn: any;
		private uri: string;

		// debug info
		public messagesByteDataSend: number;
		public messagesByteDataReceived: number;

		constructor(uri: string) {
			this.uri = uri;
			this.messagesByteDataSend = 0;
			this.messagesByteDataReceived = 0;
		}

		public connect() {
			this.conn = new WebSocket(this.uri);
			this.conn.onmessage = this.onMessage.bind(this);
		}

		public onMessage(message: any) {
			this.messagesByteDataReceived += this.lengthInUtf8Bytes(message.data);
			let message = JSON.parse(message.data);
			switch(message.type) {
			    case MessageType.INIT:
			        this.init(message);
			        break;
			    case MessageType.NEW_PLAYER:
			        this.newPlayer(message);
			        break;
				case MessageType.VELOCITY:
			        this.velocity(message);
			        break;
				case MessageType.MOVE:
			        this.move(message);
			        break;
				case 'removePlayer':
			        this.removePlayer(message);
			        break;
				case 'requestEnter':
			        this.requestEnter(message);
			        break;
				case MessageType.ATTACK:
			        this.attack(message);
			        break;
				case 'playerKilled':
			        this.playerKilled(message);
			        break;
	        	case MessageType.SKILL:
			        this.skill(message);
			        break;
				case 'takeDamage':
					this.takeDamage(message);
					break;
			    default:
			        console.log('no type');
			}
		}

		public init = function(message: any) {
			// empty method to be overwrite
		}

		public newPlayer = function(message: any) {
			// empty method to be overwrite
		}

		public move = function(message: any) {
			// empty method to be overwrite
		}

		public velocity = function(message: any) {
			// empty method to be overwrite
		}

		public removePlayer = function(message: any) {
			// empty method to be overwrite
		}

		public requestEnter = function(message: any) {
			// empty method to be overwrite
		}

		public attack = function(message: any) {
			// empty method to be overwrite
		}

		public playerKilled = function(message: any) {
			// empty method to be overwrite
		}

		public debug = function(message: any) {
			// empty method to be overwrite
		}

		public skill = function(message: any) {
			// empty method to be overwrite
		}
		public takeDamage = function(message: any) {
			// empty method to be overwrite
		}

		public send(message: any) {
			let message = JSON.stringify(message)
            this.conn.send(message);
            this.messagesByteDataSend += this.lengthInUtf8Bytes(message);
		}

        public lengthInUtf8Bytes(str) {
          // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
          var m = encodeURIComponent(str).match(/%[89ABab]/g);
          return str.length + (m ? m.length : 0);
        }
	}
}