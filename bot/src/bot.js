import io from 'socket.io-client';

export default class Bot {
	constructor() {
		const socket = io('http://localhost:9000');
	}

}