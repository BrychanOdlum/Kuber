const Bot = require('./bot');

(async () => {
	for (let i = 0; i < 20; i++) {
		(async () => {
			const b1 = new Bot();
			await b1.createTeam("Team "+i)
			await b1.init()

			b1.randomMove()
		})()
	}
})()
