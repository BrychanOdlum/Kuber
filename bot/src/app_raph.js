const io = require('socket.io-client');

class Bot {
  constructor() {
    this.socket = io('http://localhost:9000');

    this.leaderWeighting = Math.random();

    this.socket.on('move', ({id, coordinate}) => {
      if (id === this.socket.id) {
        this.coordinate = coordinate;
      }
    });
  }

  async connectToTeam(teamId) {
    return new Promise(resolve => {
      this.socket.on('init', () => {
        resolve();
      });

      this.socket.emit('join team', teamId);
    });
  }

  async createTeam(name) {
    return new Promise(resolve => {
      this.socket.on('init', () => {
        resolve();
      });

      this.socket.emit('create team', {
        name,
      });
    });
  }

  async init() {
    return new Promise(resolve => {
      this.socket.on('arena infos', ({arena}) => {
        this.team = arena.team;
        this.arena = arena;
        for (const team of arena.teams) {
          for (const player of team.players) {
            if (player.id === this.socket.id) {
              this.coordinate = player.coordinate;
              resolve();
            }
          }
        }
      });

      this.socket.emit('arena infos');
    });
  }

  randomMoves() {
    setInterval(() => {
      this.randomMove();
    }, 200);
  }

  randomMove() {
    const moves = ['up', 'down', 'left', 'right'];

    const move = moves[Math.floor(Math.random() * moves.length)];

    this.socket.emit('move', move);
  }

  moveToTarget(target) {
    this.moveInterval && clearInterval(this.moveInterval);

    if (target) {
      const {x, y} = target;

      this.moveInterval = setInterval(() => {
        const needLeft = this.coordinate.x > x;
        const needRight = this.coordinate.x < x;
        const needUp = this.coordinate.y > y;
        const needDown = this.coordinate.y < y;

        const ops = [needLeft, needRight, needUp, needDown];
        const opsNames = ['left', 'right', 'up', 'down'].filter((n, i) => ops[i]);

        if (opsNames.length === 0) {
          // Sleep
          //this.randomMove()
        } else {
          const move = opsNames[Math.floor(Math.random() * opsNames.length)];

          this.socket.emit('move', move);
        }
      }, 200);
    } else {
      this.randomMoves();
    }
  }
}

(async () => {
  for (let i = 0; i < 3; i++) {
    (async () => {
      const bots = [];

      const b1 = new Bot();
      b1.__MASTER = true
      bots.push(b1);
      await b1.createTeam(`Team ${i}`);
      await b1.init();

      const ox = Math.floor(Math.random() * b1.arena.width - 5);
      const oy = Math.floor(Math.random() * b1.arena.height - 5);

      const teamId = b1.team.id;

      const count = 4;

      for (let j = 0; j < count; j++) {
        const bc = new Bot();
        bots.push(bc);
        await bc.connectToTeam(teamId);
        await bc.init();

        bc.socket.on('shape', shape => {
          const locations = [];
          for (let y = 0; y < shape.grid.length; y++) {
            for (let x = 0; x < shape.grid[y].length; x++) {
              const c = shape.grid[y][x];

              if (c) {
                locations.push({x, y});
              }
            }
          }

          if (locations[j]) {
            bc.moveToTarget({x: locations[j].x + ox, y: locations[j].y + oy});
          } else {
            bc.moveToTarget();
          }
        });

      }

    })();
  }
})();
