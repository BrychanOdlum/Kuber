const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(9000, () => {
  console.log('Server started');
});

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

class Position {
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
  }

  addPlayer(player) {
    this.players[player.id] = player
  }

  removePlayer(player) {
    delete this.players[player.id]
  }

  findPlayer(id) {
    for (const player of this.players) {
      if (player.id === id) {
        return player;
      }
    }

    return null;
  }

  getGrid() {
    const grid = [];
    for (let y = 0; y < this.height; y++) {
      grid[y] = [];

      for (let x = 0; x < this.width; x++) {
        grid[y][x] = null;
      }
    }

    for(const player of Object.values(this.players)) {
      grid[player.position.y][player.position.x] = player
    }
  }
}

class Player {
  constructor(id, x, y) {
    this.id = id;
    this.position = new Position(x, y)
  }
}

const arena = new Arena(40, 40);

io.on('connection', (socket) => {
  const id = socket.id;
  const player = new Player(id, Math.round(arena.width/2), Math.round(arena.height/2));

  arena.addPlayer(player);

  socket.emit('init', {
    arena: {
      width: arena.width,
      height: arena.height,
      players: Object.values(arena.players),
      grid: arena.getGrid(),
    },
  });

  socket.broadcast.emit('join', player);

  socket.on('disconnect', () => {
    arena.removePlayer(player)

    socket.broadcast.emit('leave', {
      id: player.id,
    })
  });

  socket.on('move', (direction) => {
    console.log('Move', direction);

    switch (direction) {
      case 'up':
        player.position.y++;
        break;
      case 'down':
        player.position.y--;
        break;
      case 'right':
        player.position.x++;
        break;
      case 'left':
        player.position.x--;
        break;
    }

    io.emit('move', {
      id: player.id,
      position: player.position
    })
  });

});
