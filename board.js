const tileTypes = {
	mine: 11,
	flag: 10,
	undiscovered: 9
};

class Board {

	constructor(width, height, mineCount) {
		this.width = width;
		this.height = height;
		this.mineCount = mineCount;

		this.discovered = [];
		this.flags = [];

		this.tiles = [];
		for (let x = 0; x < width; x++)
			this.tiles[x] = new Array(height);

		for (let i = 0; i < mineCount; i++) {
			let x = Math.floor(Math.random() * this.width);
			let y = Math.floor(Math.random() * this.height);
			if (this.isMine(x, y))
				this.mineCount--;
			this.tiles[x][y] = tileTypes.mine;
		}

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				if (this.isMine(x, y))
					continue;
				this.tiles[x][y] = this.countMinesAround(x, y);
			}
		}
	}

	isInBounds(x, y) { return (x >= 0 && x < this.width && y >= 0 && y < this.height); }

	isMine(x, y) { return this.isInBounds(x, y) && (this.tiles[x][y] == tileTypes.mine); }

	getMinesRemaining() { return this.mineCount - this.flags.length; }

	getMinesForDisplay() {
		let m = [];
		for (let x = 0; x < this.width; x++)
			for (let y = 0; y < this.height; y++)
				if (this.isMine(x, y))
					m.push({i: this.cellIndex({x: x, y: y}), t: tileTypes.mine});
		return m;
	}

	getAllForDisplay() {
		let m = [];
		for (let x = 0; x < this.width; x++)
			for (let y = 0; y < this.height; y++)
				m.push({i: this.cellIndex({x: x, y: y}), t: this.tiles[x][y]});
		return m;
	}

	countMinesAround(x, y) {
		let count = 0;
		for (let xa = x-1; xa <= x+1; xa++)
			for (let ya = y-1; ya <= y+1; ya++)
				if (!(xa == x && ya == y) && this.isMine(xa, ya))
					count++;
		return count;
	}

	cellIndex(cell) { return cell.y * this.width + cell.x; }

	cellFromIndex(index) { return {x: index % this.width, y: Math.floor(index / this.width) }; }

	getNeighbors(i) {
		let c = this.cellFromIndex(i);
		let n = [];
		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				if (x == 0 && y == 0)
					continue;
				let m = {x: c.x + x, y: c.y + y};
				if (this.isInBounds(m.x, m.y))
					n.push(this.cellIndex(m));
			}
		}
		return n;
	}

	BFS(todo, discovered) {
		if (todo.size <= 0)
			return discovered;

		let c = todo.shift();
		if (!c && c != 0)
			return discovered;

		discovered.add(c);

		let p = this.cellFromIndex(c);
		if (this.tiles[p.x][p.y] != 0)
			return this.BFS(todo, discovered);

		let neighbors = this.getNeighbors(c);
		for (let n of neighbors) {
			if (!discovered.has(n) && !todo.includes(n) && !this.discovered.includes(n))
				todo.push(n);
		}

		return this.BFS(todo, discovered);
	}

	// Runs a flood fill and returns the tiles that were explored.
	discover(x, y) {
		if (!this.isInBounds(x, y))
			return [];

		if (this.flags.includes(this.cellIndex({x: x, y: y})))
			return [];
		// If we hit a mine... then game over.
		if (this.isMine(x, y))
			return false;

		// Do the BFS to get a list of tiles indices discovered.
		let todo = [];
		todo.push(this.cellIndex({x: x, y: y}));
		let discovered = this.BFS(todo, new Set());

		// Take the discovered tile indices and map them to the type of tile at
		// each index.
		let tiles = [];
		for (let d of discovered) {
			let c = this.cellFromIndex(d);
			tiles.push({i: d, t: this.tiles[c.x][c.y]});
			this.discovered.push(d);
		}

		return tiles;
	}

	// Adds the flag and returns the map used to update the board.
	flag(x, y) {
		if (!this.isInBounds(x, y))
			return [];

		let i = this.cellIndex({x: x, y: y});

		if (this.discovered.includes(i))
			return [];

		let j = this.flags.indexOf(i);
		if (j != -1) {
			this.flags.splice(j, 1);
			return [{i: i, t: tileTypes.undiscovered}];
		}

		this.flags.push(i);
		return [{i: i, t: tileTypes.flag}];
	}

	getDiscovered() {
		let discovered = [];
		for (let d of this.discovered) {
			let c = this.cellFromIndex(d);
			discovered.push({i: d, t: this.tiles[c.x][c.y]});
		}
		for (let i of this.flags)
			discovered.push({i: i, t: tileTypes.flag});
		return discovered;
	}

}

module.exports = Board;
