export default class Player {
    constructor(game, id, location) {
        this.game = game;

        this.id = id;
        this.location = location;
        this.color = 'rgb(255,0,0)';
    }

    move(location) {
        this.location = location;
    }

    render() {
        const game = this.game;
        const location = this.location;

        const positionX = (location.x * game.tileSize) + (game.offsetX);
        const positionY = (location.y * game.tileSize) + (game.offsetY);

        game.context.fillStyle = this.color;
        game.context.fillRect(positionX, positionY, game.tileSize, game.tileSize);
    }
}
