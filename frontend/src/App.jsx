import React, {Component} from 'react';
import '../node_modules/normalize.css/normalize.css';

import './App.scss';
import Arena from './Arena';
import socket from './arena/socket';
import Setup from "./Setup";

import logo from './assets/game-logo.png';

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
        <Setup>
          <div>
            <div className={"team-container"}>
              <img src={logo} alt={"logo"} className={"logo"}/>
              <div className={"present-team-container"}>
                {this.state.teams.map((team, i) => (
                    <div className={"teams"} key={i} onClick={() => this.joinTeam(team)}>
                      {team.name}
                    </div>
                ))}
              </div>
              <input className={"team-input"} type={"text"}
                     value={this.state.teamName} placeholder={"Enter Team Name"}
                     onChange={(e) => this.setState({teamName: e.target.value})}/>
              <button className={"team-submit"} onClick={() => this.createTeam()}>
                Create Team
              </button>
            </div>
          </div>
        </Setup>
    );
  }
}

export default App;
