import Coordinate from "./coordinate";

export default class Player {
	constructor(game, location) {
		this.game = game;

		this.location = location;
		this.color = 'rgb(255,0,0)';
	}

	render() {
		const game = this.game;
		const location = this.location;

		const positionX = (location.x * game.tileSize) - game.offsetX;
		const positionY = (location.y * game.tileSize) - game.offsetY;

		game.context.fillRect(positionX, positionY, game.tileSize, game.tileSize);
	}
}