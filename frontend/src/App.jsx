import React, {Component} from 'react';
import '../node_modules/normalize.css/normalize.css';

import './App.scss';
import Canvas from './Canvas';
import socket from './arena/socket';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      score: 0,
      time: 0,
      shape: null,
    };
  }

  componentDidMount() {
    socket.on('reward', (data) => {
      console.log('REWARD', data);

      this.setState({
        score: data.score,
      });
    });

    socket.on('shape', (data) => {
      console.log('SHAPE', data);

      this.setState({
        shape: data,
      });
    });

    socket.on('tick', (data) => {
      this.setState({
        time: data
      })
    });
  }

  renderShape() {
    const {shape} = this.state;

    if (!shape) {
      return null;
    }

    return (
        <table className={"shape"}>
          <tbody>
          {shape.grid.map(row => (
              <tr>
                {row.map(c => {
                  return (<td className={c ? "block" : ""} />)
                })}
              </tr>
          ))}
          </tbody>
        </table>
    );
  }

  render() {
    return (
        <div>
          <div className={'info'}>
            <div className={'score'}>{this.state.score}</div>
            <div className={'time'}>{this.state.time}</div>
            {this.renderShape()}

          </div>
          <Canvas/>
        </div>
    );
  }
}

export default App;
