const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(9000, () => {
  console.log('Server started');
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

class Coordinate {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Arena {
  constructor(w, h) {
    this.width = w;
    this.height = h;

    this.players = {};

    this.time = null;
    this.interval = null;
  }

  start() {
    this.time = 10;
    this.newShape();
    this.interval = setInterval(() => {
      this.time--;
      this.tick();

      if (this.time === 0) {
        this.end();
        this.start();
      }
    }, 1000);
  }

  end() {
    this.interval && clearInterval(this.interval);

    this.reward();
  }

  newShape() {
    this.shape = shapes[Math.floor(Math.random() * shapes.length)];
    for (const player of this.getPlayers()) {
      player.socket.emit('shape', this.shape);
    }
  }

  tick() {
    for (const player of this.getPlayers()) {
      player.socket.emit('tick', this.time);
    }
  }

  reward() {
    if (this.matchShape()) {
      for (const player of this.getPlayers()) {
        player.socket.emit('reward', {
          reward: 1,
          score: ++player.score,
        });
      }
    }
  }

  addPlayer(player) {
    this.players[player.id] = player;
  }

  removePlayer(player) {
    delete this.players[player.id];
  }

  findPlayer(id) {
    for (const player of this.getPlayers()) {
      if (player.id === id) {
        return player;
      }
    }

    return null;
  }

  getGrid(serialize = false) {
    const grid = [];
    for (let y = 0; y < this.height; y++) {
      grid[y] = [];

      for (let x = 0; x < this.width; x++) {
        grid[y][x] = null;
      }
    }

    for (let player of this.getPlayers()) {
      if (serialize) {
        player = player.serialize()
      }

      grid[player.coordinate.y][player.coordinate.x] = player;
    }

    return grid;
  }

  getPlayers() {
    return Object.values(this.players);
  }

  matchShape() {
    const shape = this.shape;

    if (arena.width < shape.width) {
      return false;
    }

    if (arena.height < shape.height) {
      return false;
    }

    const grid = this.getGrid();

    for (let oy = 0; oy < this.height - shape.height; oy++) {
      for (let ox = 0; ox < this.width - shape.width; ox++) {
        let match = true;
        for (let sy = 0; sy < shape.height; sy++) {
          for (let sx = 0; sx < shape.width; sx++) {
            const x = ox + sx;
            const y = oy + sy;

            if (shape.grid[sy][sx] == true && grid[y][x] === null) {
              match = false;
            }
          }
        }
        if (match) {
          return true;
        }
      }
    }

    return false;
  }
}

class Player {
  constructor(id, x, y, socket) {
    this.id = id;
    this.coordinate = new Coordinate(x, y);
    this.socket = socket;
    this.score = 0;
  }

  serialize() {
    return {id: this.id, coordinate: this.coordinate, score: this.score};
  }
}

class Shape {
  constructor(grid) {
    let width;
    for (const row of grid) {
      if (width && width !== row.length) {
        throw new Error('The grid must have homogeneous width');
      }
      width = row.length;
    }

    this.width = width;
    this.height = grid.length;
    this.grid = grid;
  }
}

const shapes = [
  new Shape([
    [1, 0, 1],
  ]),
  new Shape([
    [1, 1],
  ]),
  new Shape([
    [1],
    [1],
  ]),
  new Shape([
    [1],
    [0],
    [1],
  ]),
];

const arena = new Arena(30, 30);
arena.start();

io.on('connection', (socket) => {
  const id = socket.id;
  const player = new Player(
      id,
      Math.round(arena.width / 2),
      Math.round(arena.height / 2),
      socket,
  );

  arena.addPlayer(player);

  socket.emit('init', {
    arena: {
      width: arena.width,
      height: arena.height,
      players: arena.getPlayers().map(p => p.serialize()),
      grid: arena.getGrid(true),
    },
  });

  socket.broadcast.emit('join', player.serialize());

  socket.on('disconnect', () => {
    arena.removePlayer(player);

    socket.broadcast.emit('leave', {
      id: player.id,
    });
  });

  socket.on('move', (direction) => {
    console.log('Move', direction, player.coordinate);

    switch (direction) {
      case 'up':
        if (player.coordinate.y > 0) {
          player.coordinate.y--;
        }
        break;
      case 'down':
        if (player.coordinate.y < arena.height - 1) {
          player.coordinate.y++;
        }
        break;
      case 'right':
        if (player.coordinate.x < arena.width - 1) {
          player.coordinate.x++;
        }
        break;
      case 'left':
        if (player.coordinate.x > 0) {
          player.coordinate.x--;
        }
        break;
    }

    io.emit('move', {
      id: player.id,
      coordinate: player.coordinate,
    });
  });
});
