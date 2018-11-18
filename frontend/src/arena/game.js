import Grid from './grid';
import Coordinate from './coordinate';
import Listeners from './listeners';

import Player from './player';

import { EasingFunctions } from './utils';

export default class Game {
    constructor(canvas) {
        this.offsetX = 0;
        this.offsetY = 0;

        this.tileSize = 40;

        this.scale = 1;

        this.grid = new Grid(this);

        this.players = {};

        // Set context
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        this.addPlayer(new Player(this, 1, new Coordinate(5, 1)));
        this.addPlayer(new Player(this, 2, new Coordinate(20, 20)));
        this.setCurrentPlayer(2);

        this.resizeCanvas();

        new Listeners(this);

        this.render = this.render.bind(this);
        this.render();
    }

    resizeCanvas() {
        console.log(this.canvas.height);
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
