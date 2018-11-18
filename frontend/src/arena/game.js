import Grid from './grid';
import Coordinate from './coordinate';
import Listeners from './listeners';
import socket from './socket';

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

    this.players = {};

    // Set context
    this.context = context;

    new Listeners(this);

    this.render = this.render.bind(this);
    this.render();

    socket.on('connect', () => {
      console.log(socket.id);
      this.setCurrentPlayer(socket.id);
    });

    socket.on('init', data  => {
      console.log(data);

      for (const player of data.arena.players) {
        this.addPlayer(new Player(this, player.id, new Coordinate(player.coordinate.x, player.coordinate.y)))
      }
    });

    socket.on('move', data  => {
      console.log("MOVE", data);
      const player = this.getPlayer(data.id);

      this.movePlayer(player, new Coordinate(data.coordinate.x, data.coordinate.y))
    });

    socket.on('join', (player) =>  {
      console.log("JOIN", player)

      this.addPlayer(new Player(this, player.id, new Coordinate(player.coordinate.x, player.coordinate.y)))
    });

    socket.on('leave', (data) =>  {
      console.log("LEAVE", data)
      this.removePlayer(data.id)
    });

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
    player.move(location);
  }

  render() {
    this.context.clearRect(0, 0, this.context.canvas.width,
        this.context.canvas.height);

    this.grid.render();

    Object.values(this.players).forEach(player => {
      player.render();
    });

    requestAnimationFrame(this.render);
  }
}
