class Board {

	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.rebuild = true;

		this.tiles = [];
		for (let x = 0; x < width; x++)
			this.tiles[x] = new Array(height);
	}

	setShader(shader) {
		this.shader = shader;
		return this;
	}

	setTileSheet(tileSheet) {
		this.tileSheet = tileSheet;
		return this;
	}

	getWidth() { return this.width; }

	getHeight() { return this.height; }

	setTile(x, y, tile) { this.tiles[x][y] = tile; }

	scheduleRebuild() { this.rebuild = true; }

	createRenderData() {
		// Create a VAO object
		let mesh = new VAO(gl.TRIANGLES);

		// Go through each tile in the level
		for (let x = 0; x < this.width; x++) {
			for (let y = 0; y < this.height; y++) {
				// Get the current tile from the level
				let tile = this.tiles[x][y];

				// If the current tile is empty, then move to the next tile.
				if (!tile || tile == null)
					continue;

				// (The difference between the next two is hard to explain... I'm gonna have to come back to this)
				// Get the coords of the current tile on the texture sheet (these are integer coords where (0,0) and (1,0) are whole, adjacent tiles)
				let tileSheetCoords = tile.tileSheetCoords;
				// Get the texture coords of the tile sheet coords of the current tile.
				let texCoord = this.tileSheet.getTexCoords(tileSheetCoords.x, tileSheetCoords.y);

				if (!texCoord || texCoord == null)
					continue;

				// Put the vertex data into the VAO.
				mesh.setTexCoord([texCoord.x, texCoord.y]);
				mesh.addVertex([0+x, 0+y]);
				mesh.setTexCoord([texCoord.mx, texCoord.y]);
				mesh.addVertex([1+x, 0+y]);
				mesh.setTexCoord([texCoord.mx, texCoord.my]);
				mesh.addVertex([1+x, 1+y]);

				mesh.setTexCoord([texCoord.mx, texCoord.my]);
				mesh.addVertex([1+x, 1+y]);
				mesh.setTexCoord([texCoord.x, texCoord.my]);
				mesh.addVertex([0+x, 1+y]);
				mesh.setTexCoord([texCoord.x, texCoord.y]);
				mesh.addVertex([0+x, 0+y]);
			}
		}
		// Send the VAO to the graphics card.
		mesh.build(this.shader);
		return mesh;
	}

	render() {
		if (this.rebuild) {
			// If we've previously created render data for this board,
			// get rid of it.
			if (this.mesh)
				this.mesh.cleanUp();

			this.mesh = this.createRenderData();
			this.rebuild = false;
		}

		this.shader.bind();
		this.mesh.draw();
	}

}
