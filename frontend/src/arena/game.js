import Grid from './grid';
import Listeners from './listeners';

import {EasingFunctions} from './utils';

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

  render() {
    // Update camera
    this.cameraTransformations.forEach(transformation => {
      let progress = (Date.now() - transformation.startTime) / 400;
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

    this.cameraTransformations = this.cameraTransformations.filter(
        t => t.moveComplete < 1);

    // Clear rect
    this.context.clearRect(0, 0, this.context.canvas.width,
        this.context.canvas.height);

    // Render grid
    this.grid.render();

    // Render players
    Object.values(this.players).forEach(player => {
      player.render();
    });

    requestAnimationFrame(this.render);
  }
}
