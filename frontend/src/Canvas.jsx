import React, {Component} from 'react';

import './Canvas.scss';
import Game from './arena/game';

export default class Canvas extends Component {

    componentDidMount() {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");
	    let game = new Game(ctx, {width: 640, height: 500});
    }

render() {
    return(
        <div>
            <canvas className={"canvas"} ref={"canvas"} width={640} height={500} />
        </div>
    )
}
}