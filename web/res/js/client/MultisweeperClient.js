const identityMatrix = new Float32Array(16);
glMatrix.mat4.identity(identityMatrix);

const boomText = $('#boomText');
const userList = $('#userList');
const timeDisplay = $('#time');
var timerTimeout = null;
const mineDisplay = $('#mines');
const deathMessage = $('#deathMessage');

const updateRoomInfo = function(data) {
	userList.empty();
	userList.append('<li class="header">USERS</li>');
	for (let u of data.users)
		userList.append(`<li>${u.name}</li>`);

	timeDisplay.text(data.time);
	mineDisplay.text(data.minesLeft);
}

const incrementTimer = function() {
	let currentTime = parseInt(timeDisplay.text());
	timeDisplay.text(currentTime+1);

	if (timerTimeout)
		clearTimeout(timerTimeout);

	timerTimeout = setTimeout(incrementTimer, 1000);
}

const canvas = document.getElementById('game');
const gl = canvas.getContext('webgl');
const ext = gl.getExtension('OES_vertex_array_object');

const createTile = function(name, x, y) { return { name: name, tileSheetCoords: {x: x, y: y} }; }
let tiles = [];
tiles[0] = createTile("zero", 3, 0);
tiles[1] = createTile("one", 0, 1);
tiles[2] = createTile("two", 1, 1);
tiles[3] = createTile("three", 2, 1);
tiles[4] = createTile("four", 3, 1);
tiles[5] = createTile("five", 0, 2);
tiles[6] = createTile("six", 1, 2);
tiles[7] = createTile("seven", 2, 2);
tiles[8] = createTile("eight", 3, 2);
tiles[9] = createTile("unexplored", 0, 0);
tiles[10] = createTile("flag", 1, 0);
tiles[11] = createTile("mine", 2, 0);

class MultisweeperClient {

	constructor() {
		this.viewMatrix = new Float32Array(16);
		this.inverseView = new Float32Array(16);
		this.pings = [];
	}

	setShaderViewMatrix(shader) {
		shader.bind();
		shader.setUniformMat4(shader.viewMatrixLocation, this.viewMatrix);
	}

	setViewBounds(x, y, mx, my) {
		let width = mx - x;
		let height = my - y;
		let cx = (x + mx) * 0.5;
		let cy = (y + my) * 0.5;
		glMatrix.mat4.translate(this.viewMatrix, identityMatrix, [-cx * 2 / width, -cy * 2 / height, 0]);
		glMatrix.mat4.scale(this.viewMatrix, this.viewMatrix, [2 / width, 2 / height, 1]);
		// Find the inverse view matrix used for taking mouse click positions to board positions
		glMatrix.mat4.invert(this.inverseView, this.viewMatrix);
	}

	setViewCenterHeight(cx, cy, height) {
		let width = height / canvas.height * canvas.width;
		glMatrix.mat4.translate(this.viewMatrix, identityMatrix, [-cx * 2 / width, -cy * 2 / height, 0]);
		glMatrix.mat4.scale(this.viewMatrix, this.viewMatrix, [2 / width, 2 / height, 1]);
		// Find the inverse view matrix used for taking mouse click positions to board positions
		glMatrix.mat4.invert(this.inverseView, this.viewMatrix);
	}

	onResize() {
		// Get the size of the canvas on the display
		let rect = canvas.getBoundingClientRect();

		// Update the size of the canvas's image so it fills
		// the space it takes up perfectly.
		canvas.width = rect.width;
		canvas.height = rect.height;

		// Set the webgl viewport
		gl.viewport(0,0,canvas.width, canvas.height);


		// If we know what the dimensions of the board are...
		if (this.board) {
			// Set up the view matrix
			this.setViewCenterHeight(this.board.getWidth() / 2, this.board.getHeight() / 2, this.board.getHeight());
		}

		// Update the view matrix in the shader program
		if (Shader.shaders && Shader.shaders.defaultShader)
			this.setShaderViewMatrix(Shader.shaders.defaultShader);
	}

	createBoard(width, height) {
		this.board = new Board(width, height);
		this.board.setShader(Shader.shaders.defaultShader);
		this.board.setTileSheet(Texture.textures.tileSheet);
		for (let x = 0; x < width; x++)
			for (let y = 0; y < height; y++)
				this.board.tiles[x][y] = tiles[9];
		this.shouldResize = true;
	}

	getBoard() { return this.board; }

	init() {
		// Set the initial view
		this.onResize();

		// Background color
		gl.clearColor(0.5, 0.5, 0.5, 1);

		Shader.shaders = {};
		let ds = new Shader(defaultVertexShaderSource, defaultFragmentShaderSource);
		if (!ds.init()) {
			console.error("Failed to create default shader.");
			return;
		}
		ds.viewMatrixLocation = ds.getUniformLocation('viewMatrix');
		Shader.shaders.defaultShader = ds;

		Texture.textures = {};
		Texture.textures.tileSheet = new TileSheet('/textures/minesweeper_tiles.jpg', 4, 3);
		Texture.textures.tileSheet.init();

		$.get('/app/discovered')
			.done((data) => {
				console.log('Request returned data: ');
				console.log(data);
				c.updateBoard(data);
			})
			.fail((jqxhr, status, error) => {
				console.log(`Request Failed: ${status}`);
				console.log(jqxhr.responseText);
			});

		$.get('/app/roomInfo')
			.done((data) => {
				console.log('Request returned data: ');
				console.log(data);
				updateRoomInfo(data);
			})
			.fail((jqxhr, status, error) => {
				console.log(`Request Failed: ${status}`);
				console.log(jqxhr.responseText);
			});

		let c = this;
		this.eventSource = new EventSource('/app/subscribe');
		this.eventSource.addEventListener("BOARD", (event) => {
			c.updateBoard(JSON.parse(event.data));
		});
		this.eventSource.addEventListener("BOOM", (event) => {
			deathMessage.text(`${event.data} CLICKED A FUCKING MINE`);
		});
		this.eventSource.addEventListener("TIMEOVER", (event) => {
			deathMessage.text("YOU FUCKING RAN OUT OF TIME YOU STUPID BITCH");
		});
		this.eventSource.addEventListener("ROOM", (event) => {
			updateRoomInfo(JSON.parse(event.data));
			incrementTimer();
		});
		this.eventSource.addEventListener("RESET", (event) => {
			let d = JSON.parse(event.data);
			c.createBoard(d.width, d.height);
			deathMessage.text("");
		});

		canvas.onmousedown = (e) => {
			let screenPos = glMatrix.vec4.fromValues(e.offsetX / canvas.width * 2 - 1, 1 - e.offsetY / canvas.height * 2, 0 ,1);
			let worldPos = glMatrix.vec4.create();
			glMatrix.vec4.transformMat4(worldPos, screenPos, this.inverseView);
			let x = Math.floor(worldPos[0]);
			let y = Math.floor(worldPos[1]);

			if (e.buttons & 1)
				this.requestClick(x, y, "DISCOVER");
			else if (e.buttons & 2)
				this.requestClick(x, y, "FLAG");
		};
		canvas.oncontextmenu = (e) => { e.preventDefault(); };
	}

	render() {
		if (this.shouldResize)
			this.onResize();
		if (this.board)
			this.board.render();
		for (let i = 0; i < this.pings.length; i++) {
			if (pings[i].render()) {
				pings.splice(i, 1);
				i--;
			}
		}
	}

	start() {
		let b = this;
		const loop = function() {
			gl.clear(gl.COLOR_BUFFER_BIT);
			b.render();
			requestAnimationFrame(loop);
		}
		requestAnimationFrame(loop);
	}

	cellFromIndex(index) { return {x: index % this.board.width, y: Math.floor(index / this.board.width) }; }

	requestClick(x, y, command) {
		let ux = encodeURIComponent(x);
		let uy = encodeURIComponent(y);
		let ucommand = encodeURIComponent(command);
		$.get(`/app/click?x=${ux}&y=${uy}&command=${ucommand}`)
			.done((data) => {
				console.log('Request returned data: ');
				console.log(data);
			})
			.fail((jqxhr, status, error) => {
				console.log(`Request Failed: ${status}`);
				console.log(jqxhr.responseText);
			});
	}

	requestReset() { $.get(`/app/reset`); }

	updateBoard(data) {
		if (!this.board)
			return;

		console.log(data);
		for (let t of data) {
			console.log(t);
			let c = this.cellFromIndex(t.i);
			this.board.setTile(c.x, c.y, tiles[t.t]);
		}
		this.board.scheduleRebuild();
	}

}

class Ping {

	constructor(x, y) {

	}

	render() {
		if (!Ping.pingRenderer) {
			Ping.pingRenderer = new LineModel();
			let a = 0;
			let da = 0.1256;
			for (; a < 6.28; a += 0.1256) {
				let x1 = Math.cos(a);
				let y1 = Math.sin(a);
				let x2 = Math.cos(a+da);
				let y2 = Math.sin(a+da);
				Ping.pingRenderer.addLine(x1, y1, x2, y2, 1, 1, 1);
			}
			let x1 = Math.cos(a);
			let y1 = Math.sin(a);
			let x2 = Math.cos(0);
			let y2 = Math.sin(0);
			Ping.pingRenderer.addLine(x1, y1, x2, y2, 1, 1, 1);
		}
		Ping.pingRenderer.draw();
	}

}

const client = new MultisweeperClient();
client.init();
client.start();

$('#reset').on('click', client.requestReset);
