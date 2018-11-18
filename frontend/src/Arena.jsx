import React, {Component} from 'react';

import './Arena.scss';
import Game from './arena/game';
import socket from './arena/socket';
import Coordinate from './arena/coordinate';
import Player from './arena/player';
import Highscores from './Highscores';

export default class Arena extends Component {
  constructor(props) {
    super(props);

    this.state = {
      score: 0,
      time: 0,
      shape: null,
      ready: false,
    };
  }

  componentDidMount() {
    const canvas = this.refs.canvas;
    const game = new Game(canvas);

    socket.on('arena infos', data => {
      game.setCurrentPlayer(socket.id);

      game.gridWidth = data.arena.width;
      game.gridHeight = data.arena.height;

      for (const team of data.arena.teams) {
        for (const player of team.players) {
          game.addPlayer(
              new Player(
                  game,
                  player.id,
                  new Coordinate(
                      player.coordinate.x,
                      player.coordinate.y,
                  ),
                  team,
              ),
          );
        }
      }

      game.arenaHeight = data.arena.height;
      game.arenaWidth = data.arena.width;

      const player = game.getPlayer(game.currentPlayerId);
      const scale = (v) => (v * (game.tileSize * game.scale)) +
          ((game.tileSize * game.scale) / 2);
      const canvasCenterX = game.canvas.width / 2;
      const playerLocationX = scale(player.location.x);
      const canvasCenterY = game.canvas.height / 2;
      const playerLocationY = scale(player.location.y);

      game.offsetX = canvasCenterX - playerLocationX;
      game.offsetY = canvasCenterY - playerLocationY;

      this.setState({
        ready: true,
      });
    });

    socket.emit('arena infos');

    socket.on('move', data => {
      const player = game.getPlayer(data.id);

      game.movePlayer(player,
          new Coordinate(data.coordinate.x, data.coordinate.y));
    });

    socket.on('join', (player) => {

      game.addPlayer(
          new Player(
              game,
              player.id,
              new Coordinate(player.coordinate.x, player.coordinate.y),
              player.team,
          ),
      );
    });

    socket.on('leave', (data) => {
      game.removePlayer(data.id);
    });

    socket.on('reward', (data) => {
      this.setState({
        score: data.score,
      });
    });

    socket.on('shape', (data) => {
      this.setState({
        shape: data,
      });
    });

    socket.on('tick', (data) => {
      this.setState({
        time: data,
      });
    });
  }

  renderShape() {
    const {shape} = this.state;

    if (!shape) {
      return null;
    }

    return (
        <table className={'shape'}>
          <tbody>
          {shape.grid.map((row, i) => (
              <tr key={i}>
                {row.map((c, j) => {
                  return (<td key={j} className={c ? 'block' : ''}/>);
                })}
              </tr>
          ))}
          </tbody>
        </table>
    );
  }

  render() {
    return (
        <React.Fragment>
          <div>
            <div className={'info'}>
              <div className={'yetAnotherContainerOrYacForShort'}>
                <div className={'time'}>{this.state.time}<span className={"time-text"}>sec</span></div>
                <div className={'score'}>{this.state.score}<span className={"points-text"}>pts</span></div>
              </div>
              <div className={"pattern-container"}>
                {this.renderShape()}
              </div>
            </div>
            <canvas className={'canvas'} ref={'canvas'}/>
            <Highscores/>
          </div>
        </React.Fragment>
    );
  }
}
