const io = require('socket.io-client');

class Bot {
	constructor() {
		this.socket = io('http://localhost:9000');

		this.leaderWeighting = Math.random();

		this.socket.on('move', ({id, coordinate}) => {
			if(id === this.socket.id) {
				this.coordinate = coordinate
			}
		})
	}

	async connectToTeam(teamId) {
		return new Promise(resolve => {
			this.socket.on('init', () => {
				resolve()
			})

			this.socket.emit('join team', teamId)
		})
	}

	async createTeam(name) {
		return new Promise(resolve => {
			this.socket.on('init', () => {
				resolve()
			})

			this.socket.emit('create team', {
				name
			})
		})
	}

	async init() {
		return new Promise(resolve => {
			this.socket.on('arena infos', ({arena}) => {
				for(const team of arena.teams) {
					for (const player of team.players) {
						if(player.id === this.socket.id) {
							this.coordinate = player.coordinate
							resolve()
						}
					}
				}
			});

			this.socket.emit('arena infos')
		})
	}

	randomMove() {
		const moves = ['up', 'down', 'left', 'right'];

		setInterval(() => {
			const move = moves[Math.floor(Math.random()*moves.length)];

			this.socket.emit('move', move)
		}, 100)
	}
}

module.exports = Bot
