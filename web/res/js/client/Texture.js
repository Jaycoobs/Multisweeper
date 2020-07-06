/**
* Represents a texture on the graphics card.
**/
class Texture {

	constructor(url) { this.url = url; }

	init() {
		this.handle = gl.createTexture();
		let handle = this.handle;

		gl.bindTexture(gl.TEXTURE_2D, handle);

		// By default, the image is just a single pixel with a magenta color to indicate that the texture has not yet loaded.
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255,0,255,255]));

		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

		// Create this image object and set a callback for when it loads
		const image = new Image();
		image.onload = function() {
			// Once the image has loaded, send the image data to the graphics card.
			gl.bindTexture(gl.TEXTURE_2D, handle);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		};
		image.src = this.url;

		return handle;
	}

	bind() { gl.bindTexture(gl.TEXTURE_2D, this.handle); }

}

Texture.unbindAll = function() { gl.bindTexture(gl.TEXTURE_2D, 0); }

/**
* Represents a single texture which is comprised of multiple textures arranged in a grid.
* Useful for resolving coordinates of a given texture like (1,0) into the bounds of the
* 	desired sub-texture on the actual texture like ((1/16,0),(2/16, 1/16)).
**/
class TileSheet extends Texture {

	constructor(url, width, height) {
		super(url);
		this.width = width;
		this.height = height;
		this.epsilon = 0.01 / this.width;
	}

	// Takes the coordinates of the bottom right corner of a sub-texture and returns
	// 	the boundaries of the sub-texture in the larger texture as
	//	x: lower left x
	// 	y: lower left y
	// 	mx: upper right x
	// 	my: upper left y
	getTexCoords(x, y) {
		let coords;

		if (!y && y != 0) {coords = x; }
		else { coords = {x: x, y: y}; }

		if (!coords || coords == null)
			return null;

		return {x: coords.x / this.width + this.epsilon, my: coords.y / this.height + this.epsilon, mx: (coords.x+1) / this.width - this.epsilon, y: (coords.y+1) / this.height - this.epsilon};
	}

}
