class UserManager {

	constructor() {
		this.nextTag = 0;
		this.users = {};
	}

	addUser(user) {
		user.setTag(this.nextTag++);
		this.users[user.getTag()] = user;
	}

	removeUser(user) {
		let i = users.indexOf(user);
		if (i != -1)
			users.splice(i,1);
	}

	getUser(tag) {
		return this.users[tag];
	}

}

module.exports = UserManager;
