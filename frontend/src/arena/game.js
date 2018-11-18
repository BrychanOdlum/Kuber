import Grid from './grid';
import Coordinate from './coordinate';

import Player from './player';

export default class Game {
	constructor(context, size = {width: 500, height: 300}) {

		this.width = size.width;
		this.height = size.height;

		this.offsetX = 0;
		this.offsetY = 0;

		this.tileSize = 20;

		this.scale = 1;

		this.grid = new Grid(this);
		this.players = [];

		// Set context
		this.context = context;

		this.render();
	}

	render() {
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

		this.grid.render();

		console.log(this.players);

		this.players.forEach(player => {
			console.log('rendering player');
			player.render();
		});

		requestAnimationFrame(this.render);
	}

	addPlayer(player) {
		this.players.push(player);
	}
}