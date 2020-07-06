class User {

	constructor() {
		this.connections = [];
		this.eventId = 0;
	}

	setTag(tag) {
		this.tag = tag;
		return this;
	}

	setName(name) {
		this.name = name;
		return this;
	}

	setRoom(room) {
		this.room = room;
		return this;
	}

	getTag() { return this.tag; }

	getName() { return this.name; }

	getRoom() { return this.room; }

	addConnection(connection) { this.connections.push(connection); }

	removeConnection(connection) {
		let i = this.connections.indexOf(connection);
		if (i != -1)
			this.connections.splice(i, 1);
	}

	sendEvent(event) {
		for (let c of this.connections)
			c.write(`id: ${this.getNextEventId()}\nevent:${event.type}\ndata:${event.data}\n\n`);
	}

	getNextEventId() { return this.eventId++; }

}

module.exports = User;
