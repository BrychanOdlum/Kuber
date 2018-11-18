export default class Listeners {

    constructor(game) {
        this.game = game;
        this.setup();
    }

    setup() {
        const game = this.game;
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            switch (key) {
                case 'w':
                case 'arrowup': {
                    const player = game.getPlayer(game.currentPlayerId);
                    const location = player.location;
                    const newLocation = location.getRelative(0, -1);
                    game.movePlayer(player, newLocation);
                    break;
                }
                case 's':
                case 'arrowdown': {
                    const player = game.getPlayer(game.currentPlayerId);
                    const location = player.location;
                    const newLocation = location.getRelative(0, 1);
                    game.movePlayer(player, newLocation);
                    break;
                }
                case 'a':
                case 'arrowleft': {
                    const player = game.getPlayer(game.currentPlayerId);
                    const location = player.location;
                    const newLocation = location.getRelative(-1, 0);
                    game.movePlayer(player, newLocation);
                    break;
                }
                case 'd':
                case 'arrowright': {
                    const player = game.getPlayer(game.currentPlayerId);
                    const location = player.location;
                    const newLocation = location.getRelative(1, 0);
                    game.movePlayer(player, newLocation);
                    break;
                }
                default: {
                    return;
                }
            }
        });

        window.addEventListener('resize', (() => {
	        game.resizeCanvas();
        }));
    }
}
