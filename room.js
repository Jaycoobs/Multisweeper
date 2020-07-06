const Board = require('./board.js');

class Room {

	constructor(width, height, mines) {
		this.width = width;
		this.height = height;
		this.mines = mines;

		this.users = [];
		this.board = new Board(width, height, mines);
	}

	setCode(code) {
		this.code = code;
		return this;
	}

	setName(name) {
		this.name = name;
		return this;
	}

	getCode() { return this.code; }

	getName() { return this.name; }

	getBoard() { return this.board; }

	getTime() {
		if (!this.startedAt)
			return 0;
		return Math.floor((Date.now() - this.startedAt) / 1000);
	}

	sendEvent(event) {
		for (let u of this.users)
			u.sendEvent(event);
	}

	addUser(user) { this.users.push(user); }

	removeUser(user) {
		let i = this.users.indexOf(user);
		if (i != -1)
			this.users.splice(i, 1);
	}

	getUsers() { return this.users; }

	getBasicUserInfo() {
		let users = [];
		for (let u of this.users) {
			users.push( { name: u.getName() } );
		}
		return users;
	}

	getBasicInfo() {
		return {
			time: this.getTime(),
			minesLeft: this.board.getMinesRemaining(),
			users: this.getBasicUserInfo()
		};
	}

	showMines() {
		let event = {
			type: "BOARD",
			data: JSON.stringify(this.board.getMinesForDisplay())
		};

		this.sendEvent(event);
	}

	discover(user, x, y) {
		if (this.gameOver)
			return;
		if (!this.startedAt) {
			this.startedAt = Date.now();
			let r = this;
			this.timerTimeout = setTimeout(()=>{
				let event = {
					type: "TIMEOVER",
					data: ""
				};

				r.sendEvent(event);
				r.showMines();
				r.gameOver = true;
			}, 999000);
			let event = {
				type: "ROOM",
				data: JSON.stringify(this.getBasicInfo())
			}
			this.sendEvent(event);
		}

		let change = this.board.discover(x, y);
		// If discover returns false, then we hit a mine.
		if (!change) {
			// TODO DIE
			console.log('BOOM');
			let event = {
				type: "BOOM",
				data: user.name
			};
			this.sendEvent(event);
			this.showMines();
			this.gameOver = true;
			return;
		}

		let event = {
			type: "BOARD",
			data: JSON.stringify(change)
		};

		this.sendEvent(event);
	}

	flag(x, y) {
		if (this.gameOver)
			return;

		let change = this.board.flag(x, y);

		let event = {
			type: "BOARD",
			data: JSON.stringify(change)
		};

		this.sendEvent(event);

		event = {
			type: "ROOM",
			data: JSON.stringify(this.getBasicInfo())
		}
		this.sendEvent(event);
	}

	ping(x, y) {
		let event = {
			type: "PING",
			data: JSON.stringify({x: x, y: y})
		}

		this.sendEvent(event);
	}

	reset() {
		this.gameOver = false;
		this.startedAt = Date.now();

		if (this.timerTimeout)
			clearTimeout(this.timerTimeout);

		let event = {
			type: "RESET",
			data: JSON.stringify({width: this.width, height: this.height})
		}

		this.board = new Board(this.width, this.height, this.mines);
		this.sendEvent(event);
	}

	revealAll() {
		let event = {
			type: "BOARD",
			data: JSON.stringify(this.board.getAllForDisplay())
		};

		this.sendEvent(event);
	}

}

module.exports = Room;
