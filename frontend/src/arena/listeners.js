import socket from './socket';
import Game from './game';

export default class Listeners {

  constructor(game) {
    this.game = game;
    this.setup();
  }

  setup() {
    const game = this.game;

    // KEY DOWN
    document.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();

      switch (key) {
        case 'w':
        case 'arrowup': {
          game.activeDirections.up = true;
          break;
        }
        case 's':
        case 'arrowdown': {
	        game.activeDirections.down = true;
          break;
        }
        case 'a':
        case 'arrowleft': {
	        game.activeDirections.left = true;
          break;
        }
        case 'd':
        case 'arrowright': {
	        game.activeDirections.right = true;
          break;
        }
      }
      game.movementTick();
    });

    // KEY UP
	  document.addEventListener('keyup', (event) => {
		  const key = event.key.toLowerCase();

		  switch (key) {
			  case 'w':
			  case 'arrowup': {
				  game.activeDirections.up = false;
				  break;
			  }
			  case 's':
			  case 'arrowdown': {
				  game.activeDirections.down = false;
				  break;
			  }
			  case 'a':
			  case 'arrowleft': {
				  game.activeDirections.left = false;
				  break;
			  }
			  case 'd':
			  case 'arrowright': {
				  game.activeDirections.right = false;
				  break;
			  }
		  }
	  });

	  // WINDOW RESIZE
    window.addEventListener('resize', (() => {
      game.resizeCanvas();
    }));
  }
}
