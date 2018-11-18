import React, {Component} from 'react';

import './Canvas.scss';
import Game from './arena/game';

export default class Canvas extends Component {

    componentDidMount() {
        const canvas = this.refs.canvas;
        try {
	        let game = new Game(canvas);
        } catch (e) {
            console.error(e);
        }
    }

render() {
    return(
        <div>
            <canvas className={"canvas"} ref={"canvas"} />
        </div>
    )
}
}
