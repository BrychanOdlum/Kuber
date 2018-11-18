export default class Game {
	constructor(context, size = {width: 500, height: 300}, options = {zIndex: 1}) {
		this.objects = [];

		this.width = size.width;
		this.height = size.height;

		this.offsetX = 0;
		this.offsetY = 0;

		this.tileSize = 20;

		this.scale = 1;

		// Set context
		this.context = context;

		this.render();
	}

	render() {
		this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

		this.renderGrid();

		this.objects.forEach(o => {
			o.draw(this.context);
		});

		requestAnimationFrame(this.render);
	}

	renderGrid() {
		let x = this.offsetX;
		while (x < this.width) {
			x += this.tileSize * this.scale;

			if (x < 0) {
				continue;
			}

			this.context.beginPath();
			this.context.lineWidth = 1;
			this.context.strokeStyle = 'rgb(250,0,0)';
			this.context.moveTo(x, 0);
			this.context.lineTo(x, this.height);
			this.context.stroke();
		}

		let y = this.offsetY;
		while (y < this.height) {
			y += this.tileSize * this.scale;

			if (y < 0) {
				continue;
			}

			this.context.beginPath();
			this.context.lineWidth = 1;
			this.context.strokeStyle = 'rgb(0,0,245)';
			this.context.moveTo(0, y);
			this.context.lineTo(this.width, y);
			this.context.stroke();
		}
	}
}