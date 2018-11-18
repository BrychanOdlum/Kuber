import React, {Component} from 'react';
import '../node_modules/normalize.css/normalize.css';

import './App.scss';
import Arena from './Arena';
import socket from './arena/socket';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      teams: null,
      isInArena: false,
      teamName: '',
    };
  }

  componentWillMount() {
    socket.on('teams', teams => {
      this.setState({
        teams,
      });
    });

    socket.on('init', () => {
      this.setState({
        isInArena: true,
      });
    });
  }

  joinTeam(team) {
    socket.emit('join team', team.id);
  }

  createTeam() {
    const name = this.state.teamName;

    if (!name || name.length === 0) {
      return;
    }

    socket.emit('create team', {
      name,
    });
  }

  render() {
    if (this.state.isInArena) {
      return (
          <Arena/>
      );
    }

    if (!this.state.teams) {
      return 'Loading...';
    }

    return (
        <div>
          {this.state.teams.map((team, i) => (
              <div key={i} onClick={() => this.joinTeam(team)}>
                {team.name}
              </div>
          ))}
          <div>
            <input type="text"
                   value={this.state.teamName}
                   onChange={(e) => this.setState({teamName: e.target.value})}/>
            <button onClick={() => this.createTeam()}>
              Create team
            </button>
          </div>
        </div>
    );
  }
}

export default App;
