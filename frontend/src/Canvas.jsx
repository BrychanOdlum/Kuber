import React, {Component} from 'react';

import './Canvas.scss';

export default class Canvas extends Component {

    componentDidMount() {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "#FF0000";
        ctx.fillRect(0,0,150,75);

}

render() {
    return(
        <div>
            <canvas className={"canvas"} ref={"canvas"} width={640} height={425} />
        </div>
    )
}
}
