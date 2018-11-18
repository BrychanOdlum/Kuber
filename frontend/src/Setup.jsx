import React, {Component} from 'react';

import './Setup.scss';

export default class Setup extends Component {
  render() {
    return(
        <div className={"container"}>
          <div className={"content"}>
            {this.props.children}
          </div>
        </div>
    );
  }
}
