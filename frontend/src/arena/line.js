class Line {
	constructor(options) {
		this.options = options;
	}

	draw(context) {
		if (context == null) return false;

		context.beginPath();
		context.lineWidth = this.options.linewidth;
		context.strokeStyle = this.options.strokestyle;
		context.moveTo(this.options.x1, this.options.y1);
		context.lineTo(this.options.x2, this.options.y2);
		context.stroke();
	}
}