import React, {Component} from 'react';
import '../node_modules/normalize.css/normalize.css';

import './App.scss';
import Arena from './Arena';

class App extends Component {
  render() {
    return (
        <div>
          <Arena/>
        </div>
    );
  }
}

export default App;
