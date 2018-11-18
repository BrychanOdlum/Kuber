export default class Grid {
	constructor(game) {
		this.game = game;
	}

	render() {
		const game = this.game;
		let x = 0.5 + game.offsetX;
		while (x < game.width) {
			x += game.tileSize * game.scale;

			if (x < 0) {
				continue;
			}

			game.context.beginPath();
			game.context.lineWidth = 1;
			game.context.strokeStyle = 'rgb(130,130,130)';
			game.context.moveTo(x, 0);
			game.context.lineTo(x, game.height);
			game.context.stroke();
		}

		let y = 0.5 + game.offsetY;
		while (y < game.height) {
			y += game.tileSize * game.scale;

			if (y < 0) {
				continue;
			}

			game.context.beginPath();
			game.context.lineWidth = 1;
			game.context.strokeStyle = 'rgb(130,130,130)';
			game.context.moveTo(0, y);
			game.context.lineTo(game.width, y);
			game.context.stroke();
		}
	}
}