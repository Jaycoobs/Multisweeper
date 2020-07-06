const CodeGen = {
	charset: '123456789ABCDEF',
	codelen: 6,
	getCode: () => {
		let code = '';
		for (let i = 0; i < CodeGen.codelen; i++)
			code += CodeGen.charset[Math.floor(Math.random() * CodeGen.charset.length)];
		return code;
	}
};

class RoomManager {

	constructor() {
		this.rooms = {};
	}

	addRoom(room) {
		let code = CodeGen.getCode();
		room.setCode(code);
		this.rooms[code] = room;
	}

	removeRoom(room) {
		let i = this.rooms.indexOf(room);
		if (i != -1)
			rooms.splice(i, 1);
	}

	getRoom(code) { return this.rooms[code]; }

}

module.exports = RoomManager;
