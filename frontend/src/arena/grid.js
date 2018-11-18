export default class Grid {
  constructor(game) {
    this.game = game;
  }

  render() {
    const game = this.game;

    // X: MINIMUM
    let minX = game.offsetX;
    if (minX < 0) { minX = 0; }

    // X: MAXIMUM
    let maxX = ((game.arenaWidth * game.tileSize) + game.offsetX) * game.scale;
    if (maxX > game.canvas.width) { maxX = game.canvas.width }

	  // Y: MINIMUM
	  let minY = game.offsetY;
	  if (minY < 0) { minY = 0; }

	  // X: MAXIMUM
	  let maxY = ((game.arenaHeight * game.tileSize) + game.offsetY) * game.scale;
	  if (maxY > game.canvas.height) { maxY = game.canvas.height }

	  const stepSize = game.tileSize * game.scale;


    // RENDER: VERTICAL LINES
	  let x = 0.5 - stepSize + game.offsetX;
    while (x < maxX) {
      x += game.tileSize * game.scale;

      if (x < 0) {
        continue;
      }

      game.context.beginPath();
      game.context.lineWidth = 1;
      game.context.strokeStyle = '#333';
      game.context.moveTo(x, minY);
      game.context.lineTo(x, maxY);
      game.context.stroke();
    }

    let y = 0.5 - stepSize + game.offsetY;
    while (y < maxY) {
      y += game.tileSize * game.scale;

      if (y < 0) {
        continue;
      }

      game.context.beginPath();
      game.context.lineWidth = 1;
      game.context.strokeStyle = '#333';
      game.context.moveTo(minX, y);
      game.context.lineTo(maxX, y);
      game.context.stroke();
    }
  }
}