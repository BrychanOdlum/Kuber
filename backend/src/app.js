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

    this.teams = {};

    this.time = null;
    this.interval = null;
  }

  start() {
    this.time = 10;
    for (const team of this.getTeams()) {
      team.newShape();
    }
    this.interval = setInterval(() => {
      this.gcTeams();

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

    for (const team of this.getTeams()) {
      team.reward(this);
    }
  }

  tick() {
    for (const team of this.getTeams()) {
      for (const player of team.getPlayers()) {
        player.socket.emit('tick', this.time);
      }
    }
  }

  addTeam(id, name) {
    const t = new Team(id, name);
    this.teams[id] = t;

    return t;
  }

  gcTeams() {
    for (const id of Object.keys(this.teams)) {
      const team = this.getTeam(id);
      if (team.shouldGC) {
        delete this.teams[id];
      }
    }
  }

  getTeam(id) {
    return this.teams[id];
  }

  getTeams() {
    return Object.values(this.teams);
  }

  getGrid(serialize = false) {
    const grid = [];
    for (let y = 0; y < this.height; y++) {
      grid[y] = [];

      for (let x = 0; x < this.width; x++) {
        grid[y][x] = null;
      }
    }

    for (const team of this.getTeams()) {
      for (let player of team.getPlayers()) {
        if (serialize) {
          player = player.serialize();
        }

        grid[player.coordinate.y][player.coordinate.x] = player;
      }
    }
    return grid;
  }

  getAllPlayerCoordinates() {
    return this.getTeams().
        reduce((players, team) => [...players, ...team.getPlayers()], []).
        map(player => player.coordinate);
  }

  isTileEmpty(coordinate) {
    const playerCoordinates = this.getAllPlayerCoordinates();
    return !playerCoordinates.find(c =>
        c.x === coordinate.x && c.y === coordinate.y,
    );
  }
}

function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * (359))}, 100%, 50%)`;
}

function randId() {
  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);
}

class Team {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.color = getRandomColor();

    this.players = {};
    this.newShape();
  }

  addPlayer(player) {
    this.players[player.id] = player;
    player.team = this;
  }

  removePlayer(player) {
    player.team = null;
    delete this.players[player.id];

    if (this.getPlayers().length === 0) {
      this.shouldGC = true;
    }
  }

  getPlayers() {
    return Object.values(this.players);
  }

  newShape() {
    this.shape = shapes[Math.floor(Math.random() * shapes.length)];
    for (const player of this.getPlayers()) {
      player.socket.emit('shape', this.shape);
    }
  }

  reward(arena) {
    if (this.matchShape(arena)) {
      for (const player of this.getPlayers()) {
        player.socket.emit('reward', {
          reward: 1,
          score: ++player.score,
        });
      }
    }
  }

  matchShape(arena) {
    const shape = this.shape;

    if (arena.width < shape.width) {
      return false;
    }

    if (arena.height < shape.height) {
      return false;
    }

    const grid = arena.getGrid();

    for (let oy = 0; oy < arena.height - shape.height; oy++) {
      for (let ox = 0; ox < arena.width - shape.width; ox++) {
        let match = true;
        for (let sy = 0; sy < shape.height; sy++) {
          for (let sx = 0; sx < shape.width; sx++) {
            const x = ox + sx;
            const y = oy + sy;

            if (shape.grid[sy][sx] == true &&
                (grid[y][x] === null || grid[y][x].team.id !== this.id)) {
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

  serialize(withPlayers = false) {
    const team = {
      id: this.id,
      name: this.name,
      color: this.color,
      shape: this.shape,
    };

    if (withPlayers) {
      team.players = this.getPlayers().map(p => p.serialize());
    }

    return team;
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
    return {
      id: this.id,
      coordinate: this.coordinate,
      score: this.score,
      team: this.team ? this.team.serialize() : null,
    };
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

const arena = new Arena(100, 100);

arena.start();

io.on('connection', (socket) => {
  const id = socket.id;
  const player = new Player(
      id,
      Math.round(arena.width / 2),
      Math.round(arena.height / 2),
      socket,
  );

  socket.emit('teams', arena.getTeams().map(t => t.serialize()));

  function emitArenaInfos() {
    socket.emit('arena infos', {
      arena: {
        width: arena.width,
        height: arena.height,
        teams: arena.getTeams().map(t => t.serialize(true)),
        grid: arena.getGrid(true),
        team: player.team.serialize(true),
      },
    });
  }

  function joinTeam(team) {
    team.addPlayer(player);

    socket.emit('init', {});

    socket.broadcast.emit('join', player.serialize());
  }

  socket.on('create team', data => {
    const team = arena.addTeam(randId(), data.name);

    socket.broadcast.emit('teams', arena.getTeams().map(t => t.serialize()));

    joinTeam(team);
  });

  socket.on('join team', data => {
    joinTeam(arena.getTeam(data));
  });

  socket.on('arena infos', () => {
    emitArenaInfos();
  });

  socket.on('disconnect', () => {
    player.team && player.team.removePlayer(player);

    socket.broadcast.emit('leave', {
      id: player.id,
    });
  });

  socket.on('move', (direction) => {
    let yDiff = 0;
    let xDiff = 0;

    switch (direction) {
      case 'up':
        yDiff -= 1;
        break;
      case 'down':
        yDiff += 1;
        break;
      case 'right':
        xDiff += 1;
        break;
      case 'left':
        xDiff -= 1;
        break;
    }

    let newCoordinate = new Coordinate(player.coordinate.x +
        xDiff, player.coordinate.y + yDiff);

    if ((newCoordinate.y >= arena.height) || (newCoordinate.y < 0)) {
      yDiff = 0;
    }
    if ((newCoordinate.x >= arena.width) || (newCoordinate.x < 0)) {
      xDiff = 0;
    }

    if (!arena.isTileEmpty(newCoordinate)) {
      xDiff = 0;
      yDiff = 0;
    }

    if (xDiff !== 0 || yDiff !== 0) {
      player.coordinate = newCoordinate;
    }

    io.emit('move', {
      id: player.id,
      coordinate: player.coordinate,
    });
  });
});
