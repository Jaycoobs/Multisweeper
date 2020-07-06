const express = require('express');
const session = require('express-session');
const pug = require('pug');
const app = express();

const Room = require('./room.js');
const User = require('./user.js');
const RoomManager = require('./roomManager.js');
const UserManager = require('./userManager.js');

const rooms = new RoomManager();
const users = new UserManager();

app.set('view engine', 'pug');
app.set('views', './web/templates');
app.use(session({ secret: 'ttt' }));
app.use(express.static('./web/res/'));

app.get('/', (req, res) => { res.render('splash', {}); });
app.get('/login', (req, res) => { res.render('login', {}); });
app.get('/create/room', (req, res) => { res.render('createRoom', {}); });

app.get('/room/:roomCode', (req, res) => {
	let user = users.getUser(req.session.user);

	if (!user) {
		res.status(400);
		res.redirect('/login?redirect=' + encodeURIComponent(`/room/${req.params.roomCode}`));
		return;
	}

	let room = rooms.getRoom(req.params.roomCode);

	if (!room) {
		res.status(404);
		res.redirect('/?error=' + encodeURIComponent(`Couldn't find that room :/`));
		return;
	}

	if (user.getRoom()) {
		let r = rooms.getRoom(user.getRoom());
		r.removeUser(user);
		user.setRoom(null);
	}

	user.setRoom(room.getCode());
	room.addUser(user);
	room.revealAll();

	res.render('room', { board: {width: room.getBoard().width, height: room.getBoard().height} });
});

app.get('/app/create/room', (req, res) => {
	let width = parseInt(req.query.width || "16");
	let height = parseInt(req.query.height || "16");
	let mines = parseInt(req.query.mines || "30");

	let room = new Room(width, height, mines);
	room.setName(req.query.name);
	rooms.addRoom(room);

	res.json( { code: room.getCode() } );
});

app.get('/app/login', (req, res) => {
	let user = new User();
	user.setName(req.query.name);
	users.addUser(user);

	req.session.user = user.getTag();
	res.json({});
});

const getContext = (req, res) => {
	let user = users.getUser(req.session.user);

	if (!user) {
		res.status(400);
		res.json( { error: "NOT LOGGED IN" } );
		return false;
	}

	let room = rooms.getRoom(user.room);

	if (!room) {
		res.status(400);
		res.json( { error: "NOT IN A ROOM" } );
		return false;
	}

	return {user: user, room: room};
}

app.get('/app/subscribe', (req, res) => {
	let ctx = getContext(req, res);
	if (!ctx)
		return;

	res.setHeader('Cache-Control', 'no-cache');
	res.setHeader('Content-Type', 'text/event-stream');
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('X-Accel-Buffering', 'no');
	res.flushHeaders();

	ctx.user.addConnection(res);

	res.on('close', () => {
		ctx.user.removeConnection(res);
		res.end();
	});
});

app.get('/app/click', (req, res) => {
	let ctx = getContext(req, res);
	if (!ctx)
		return;

	console.log(req.query);

	if (!req.query.x) {
		res.status(400);
		res.json({ error: "GIVE AN X COORD" });
		return;
	}

	if (!req.query.y) {
		res.status(400);
		res.json({ error: "GIVE A Y COORD" });
		return;
	}

	let x = parseInt(req.query.x);
	let y = parseInt(req.query.y);

	if (req.query.command === "DISCOVER")
		ctx.room.discover(ctx.user, x, y);
	if (req.query.command === "FLAG")
		ctx.room.flag(x, y);
	if (req.query.command == "PING")
		ctx.room.ping(x, y);

	res.json({});
});

app.get('/app/discovered', (req, res) => {
	let ctx = getContext(req, res);
	if (!ctx)
		return;

	res.json(ctx.room.getBoard().getDiscovered());
});

app.get('/app/roomInfo', (req, res) => {
	let ctx = getContext(req, res);
	if (!ctx)
		return;

	res.json(ctx.room.getBasicInfo());
});

app.get('/app/reset', (req, res) =>  {
	let ctx = getContext(req, res);
	if (!ctx)
		return;

	ctx.room.reset();

	res.json({});
});

app.listen(8080, () => { console.log("Listening on port 8080"); });
