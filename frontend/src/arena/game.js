import Grid from './grid';
import Coordinate from './coordinate';
import Listeners from './listeners';
import socket from './socket';

import Player from './player';

import { EasingFunctions } from './utils';

export default class Game {
  constructor(canvas) {
    this.offsetX = 0;
    this.offsetY = 0;

    this.tileSize = 60;

    this.scale = 1;

    this.grid = new Grid(this);

    this.players = {};

    // Set canvas vars
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.resizeCanvas();
    this.cameraTransformations = [];

    new Listeners(this);

    this.render = this.render.bind(this);
    this.render();

    socket.on('connect', () => {
      console.log(socket.id);
      this.setCurrentPlayer(socket.id);
    });

    socket.on('init', data => {
      console.log(data);
      for (const player of data.arena.players) {
        this.addPlayer(new Player(this, player.id,
            new Coordinate(player.coordinate.x, player.coordinate.y)));
      }
    });

    socket.on('move', data => {
      console.log('MOVE', data);
      const player = this.getPlayer(data.id);

      this.movePlayer(player,
          new Coordinate(data.coordinate.x, data.coordinate.y));
    });

    socket.on('join', (player) => {
      console.log('JOIN', player);

      this.addPlayer(new Player(this, player.id,
          new Coordinate(player.coordinate.x, player.coordinate.y)));
    });

    socket.on('leave', (data) => {
      console.log('LEAVE', data);
      this.removePlayer(data.id);
    });
  }

  resizeCanvas() {
    console.log(this.canvas.height);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  addPlayer(player) {
    this.players[player.id] = player;
  }

  addPlayer(player) {
    this.players[player.id] = player;
  }

  getPlayer(id) {
    return this.players[id];
  }

  removePlayer(id) {
    delete this.players[id];
  }

  setCurrentPlayer(id) {
    this.currentPlayerId = id;
  }

  movePlayer(player, location) {
	  // Move camera
    if (player.id === this.currentPlayerId) {
	    this.cameraTransformations.push({
	      startTime: Date.now(),
        diffX: player.location.x - location.x,
        diffY: player.location.y - location.y,
        moveComplete: 0,
      });
    }

    // Move player
	  player.move(location);
  }

  render() {

    try {
	    // Update camera
	    this.cameraTransformations.forEach(transformation => {
		    let progress = (Date.now()-transformation.startTime)/400;
		    if (progress > 1) {
			    progress = 1;

		    }

		    const moveTotal = EasingFunctions.easeInOutCubic(progress);
		    const moveDiff = moveTotal - transformation.moveComplete;
		    transformation.moveComplete = moveTotal;

		    const moveDiffX = moveDiff * transformation.diffX * this.tileSize;
		    const moveDiffY = moveDiff * transformation.diffY * this.tileSize;

		    // TODO (maybe never): Floating point issue, pls float away bug, bug, never wanna see you again.

		    this.offsetX += moveDiffX;
		    this.offsetY += moveDiffY;
	    });

	    this.cameraTransformations = this.cameraTransformations.filter(t => t.moveComplete < 1);

	    console.log(this.offsetY, this.offsetX);

	    // Clear rect
	    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

	    // Render grid
	    this.grid.render();

	    // Render players
	    Object.values(this.players).forEach(player => {
		    player.render();
	    });

	    requestAnimationFrame(this.render);
    } catch (e) {
      console.log(e);
    }

  }
}
