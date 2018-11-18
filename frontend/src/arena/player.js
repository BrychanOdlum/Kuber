export default class Player {
  constructor(game, id, location, team) {
    this.game = game;

    this.id = id;
    this.location = location;
    this.team = team;
  }

  move(location) {
    this.location = location;
  }

  render() {
    const game = this.game;
    const location = this.location;
    const player = game.getPlayer(this.id);
    const userPlayer = game.getPlayer(game.currentPlayerId);

    const positionX = (location.x * game.tileSize) + (game.offsetX);
    const positionY = (location.y * game.tileSize) + (game.offsetY);


    const isOnScreen =
      (positionX + game.tileSize) > 0 && positionX < game.canvas.width &&
      (positionY + game.tileSize) > 0 && positionY < game.canvas.height;
    if (isOnScreen) {
      game.context.fillStyle = this.team.color;
      game.context.fillRect(positionX, positionY, game.tileSize, game.tileSize);
      return;
    }


    if (player.id !== userPlayer.id && player.team.id === userPlayer.team.id) {
      const distanceDiff = {
        x: positionX - (game.canvas.width / 2),
        y: positionY - (game.canvas.height / 2)
      };

      try {
        const padding = 30;

        const gradient = distanceDiff.y / distanceDiff.x;

        const padSize = {
          width: game.canvas.width - padding,
          height: game.canvas.height - padding
        };

        let arrowPos;

        if (distanceDiff.y < 0) {
          arrowPos = {
            x: (-padSize.height / 2) / gradient,
            y: -padSize.height / 2
          }
        } else { // bottom of screen
          arrowPos = {
            x: (padSize.height / 2) / gradient,
            y: padSize.height / 2
          }
        }

        if (arrowPos.x < -padSize.width / 2) {
          arrowPos = {
            x: -padSize.width / 2,
            y: gradient * -padSize.width / 2
          }
        } else if (arrowPos.x > padSize.width / 2) {
          arrowPos = {
            x: padSize.width / 2,
            y: gradient * padSize.width / 2
          }
        }

        arrowPos.x += game.canvas.width / 2;
        arrowPos.y += game.canvas.height / 2;

        game.context.fillStyle = this.team.color;
        game.context.fillRect(arrowPos.x, arrowPos.y, 10, 10);
      } catch (e) {
        console.log(e);
      }

    }


  }
}
