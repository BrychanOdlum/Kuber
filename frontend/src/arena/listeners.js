import socket from './socket';
import Game from './game';

export default class Listeners {

  constructor(game) {
    this.game = game;
    this.setup();
  }

  checkForPlayers() {
    // Fetch the whole map of current players (their locations)
    // if next position will be the taken position, cannot move.

  }

  setup() {
    const game = this.game;
    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      const player = game.getPlayer(game.currentPlayerId);

      switch (key) {
        case 'w':
        case 'arrowup': {
          const newLocation = player.location.getRelative(0, -1);
          if(newLocation.y < 0) {
            console.log("Reached boundary.");
          } else {
            socket.emit('move', 'up');
            game.movePlayer(player, newLocation);
          }
          break;
        }
        case 's':
        case 'arrowdown': {
          const newLocation = player.location.getRelative(0, 1);
          if(newLocation.y > game.getGridHeight() - 1) {
            console.log("Reached boundary.");
          } else {
            socket.emit('move', 'down');
            game.movePlayer(player, newLocation);
          }
          break;
        }
        case 'a':
        case 'arrowleft': {
          const newLocation = player.location.getRelative(-1, 0);
          if (newLocation.x < 0) {
            console.log("Reached boundary.");
          } else {
            socket.emit('move', 'left');
            game.movePlayer(player, newLocation);
          }
          break;
        }
        case 'd':
        case 'arrowright': {
          const newLocation = player.location.getRelative(1, 0);
          if(newLocation.x > game.getGridWidth() - 1) {
            console.log("Reached boundary.");
          } else {
            socket.emit('move', 'right');
            game.movePlayer(player, newLocation);
          }
          break;
        }
      }
    });

    window.addEventListener('resize', (() => {
      game.resizeCanvas();
    }));
  }
}
