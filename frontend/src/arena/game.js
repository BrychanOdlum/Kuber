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
    this.arenaHeight = 0;
    this.arenaWidth = 0;

    this.gridWidth = null;
    this.gridHeight = null;

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
      console.log("Socket id: ", socket.id);
      this.setCurrentPlayer(socket.id);
    });

    socket.on('init', data => {
      console.log("Data: ", data);
      this.gridWidth = data.arena.width;
      this.gridHeight = data.arena.height;

      for (const player of data.arena.players) {
        this.addPlayer(new Player(this, player.id,
            new Coordinate(player.coordinate.x, player.coordinate.y)));
      }

      this.arenaHeight = data.arena.height;
      this.arenaWidth = data.arena.width;


      const player = this.getPlayer(this.currentPlayerId);
	    const canvasCenterX = this.canvas.width / 2;
	    const playerLocationX = (player.location.x * (this.tileSize * this.scale)) + ((this.tileSize * this.scale) / 2);
	    const canvasCenterY = this.canvas.height / 2;
	    const playerLocationY = (player.location.y * (this.tileSize * this.scale)) + ((this.tileSize * this.scale) / 2);

	    this.offsetX = canvasCenterX - playerLocationX;
	    this.offsetY = canvasCenterY - playerLocationY;
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
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
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

  getGridWidth() {
    return this.gridWidth;
  }

  getGridHeight() {
    return this.gridHeight;
  }

  fetchPlayerPositions() {
    Object.values(this.players).forEach(player => {
      player.coordinate
    });
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
