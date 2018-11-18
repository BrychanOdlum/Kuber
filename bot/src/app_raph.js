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
          if (Math.random() > 0.2) {
            const move = opsNames[Math.floor(Math.random() * opsNames.length)];

            this.socket.emit('move', move);
          } else {
            this.randomMove();
          }
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
      bots.push(b1);
      await b1.createTeam(generateName());
      await b1.init();

      const ox = Math.floor(Math.random() * b1.arena.width - 5);
      const oy = Math.floor(Math.random() * b1.arena.height - 5);

      const teamId = b1.team.id;

      const count = 5;

      for (let j = 0; j < count; j++) {
        const bc = new Bot();
        bots.push(bc);
        await bc.connectToTeam(teamId);
        await bc.init();
      }

      for (let j = 0; j < bots.length; j++) {
        const bc = bots[j];

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

// Name generator courtesy of Tommy Hodgins: https://codepen.io/tomhodgins/pen/EVQjWG
function generateName() {
  const format = [
        '"The "+pick(adjective)',
        'pick(adjective)+" "+pick(adjective)',
        'pick(adjective)+" "+pick(noun)',
        'pick(adjective)+" "+pick(place)',
        '"2 "+pick(adjective)+" 2 "+pick(verb)',
        'pick(adjective)+" 4 Life"',
        '"Team "+pick(adjective)',
        '"Team "+pick(noun)',
        '"Team "+pick(place)',
        'pick(noun)+" With "+pick(adjective)+" "+pick(noun)',
        'pick(noun)+" With "+pick(noun)',
        'pick(noun)+" From "+pick(place)',
        'pick(noun)+" "+pick(verb)',
        'pick(noun)+" Don’t "+pick(verb)',
        'pick(place)+" "+pick(noun)',
        'pick(place)+"’s "+pick(adjective)+" "+pick(noun)',
        'pick(place)+"’s Finest"',
        'pick(verb)+" & "+pick(verb)',
        '"Keep Calm & "+pick(verb)',
      ],
      adjective = [ // the…
        'Delinquent',
        'Hilary’s-Own',
        'Surprising',
        'Unstoppable',
        'Great-Canadian',
        'Trivial',
        'Undefeated',
        'Ghetto',
        'Awesome',
        'Mighty',
        'Ratchet',
        'Neglectful',
        'Supreme',
        'Almost-Ready-To-Play',
        'PC',
        '[TRIGGERED]',
        'Microagressive',
        'Brave',
        'Top-Secret',
        'Metric',
        'Hood-Rich',
        'Ballin’',
        'Twerking-Class',
        'Raging',
        'Trill',
        '#Winning',
        'Twerking',
        'Micro-Managing',
        'Dank',
        'Privileged',
        'Omniscient',
        'College-Educated',
        'Real',
        'Royal',
      ],
      noun = [ // the…
        'Beavers',
        'SJWs',
        'Buffaloons',
        'WOEs',
        'Crew',
        'Executives',
        'Squad',
        'Cultural Appropriation',
        'Tumblristas',
        'Patriots',
        'Alex Trebek',
        'Yankees',
        'Canucks',
        'Babes',
        'OGs',
        '1%',
        'Wikipedians',
        'Thugs',
        'Gangsters',
        'Microagressions',
        'Warriors',
        'Trigger Warning',
        'Bernie Sanders',
      ],
      place = [ // from…
        'Toronto',
        'Buffalo',
        'America',
        'Canada',
        'Earth',
        'Tumblr',
        'The Internet',
        'The Past',
        'Space',
        'Nowhere',
        'The Right-Side-of-History',
        'The Trap',
        'Wikipedia',
        'The Streets',
        'The Occident',
        'The 6',
        'Rape Culture',
        'First-Class',
        'An Alternate Universe',
      ],
      verb = [ // who…
        'Destroy',
        'Can’t Even',
        'Win',
        'Have Guns',
        'Get Jokes',
        'Know Things',
        'Trivialize',
        'Lift',
        'Guess Well',
        'Lawyer Up',
        'Care',
      ];

  function pick(id) {
    return id[Math.floor(Math.random() * id.length)];
  }

  return eval(format[Math.floor(Math.random() * format.length)]);
}