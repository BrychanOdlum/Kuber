import Grid from './grid';
import Coordinate from './coordinate';
import Listeners from './listeners';

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

        this.addPlayer(new Player(this, 1, new Coordinate(5, 1)));
        this.addPlayer(new Player(this, 2, new Coordinate(20, 20)));
        this.setCurrentPlayer(2);

        new Listeners(this);

        this.render = this.render.bind(this);
        this.render();
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
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        this.grid.render();

        Object.values(this.players).forEach(player => {
            player.render();
        });

        requestAnimationFrame(this.render);
    }
}
