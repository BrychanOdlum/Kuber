import React, {Component} from 'react';

import './Highscores.scss';
import socket from './arena/socket';

export default class Highscores extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teams: null,
    };
  }

  componentDidMount() {
    socket.on('teams', teams => {
      this.setState({
        teams,
      });
    });

    socket.emit('teams');
  }

  render() {
    if (!this.state.teams) {
      return null;
    }

    return (
        <div className={'main-container'}>
          {this.state.teams.map(team => (
              <div>
                {team.name} - {team.score}
              </div>
          ))}
        </div>
    );
  }
}
