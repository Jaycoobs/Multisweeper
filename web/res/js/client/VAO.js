/**
* Vertex Array Object
* Represents vertex data on the graphics card.
**/
class VAO {

	constructor(geometry) {
		this.geometry = geometry;
		this.data = [];
	    this.color = [1,0,0];
	    this.texCoord = [0,0];
	    this.hasColor = false;
	    this.hasTexture = false;
	    this.vertexCount = 0;
	}

	// Set all of the vertex data at once.
	setData(data) { this.data = data; return this; }
	// Set the texture coordinate of the next vertex
	setTexCoord(texCoord) { this.hasTexture = true; this.texCoord = texCoord; return this; }
	// Set the color of the next vertex
	setColor(color) { this.hasColor = true; this.color = color; return this; }

	// Add a vertex with the given position, texture, and color (if specified).
	addVertex(position) {
		this.data.push(position[0], position[1], position[2] ? position[2] : 0);
        if (this.hasColor)
            this.data.push(this.color[0], this.color[1], this.color[2]);
        if (this.hasTexture)
            this.data.push(this.texCoord[0], this.texCoord[1]);
        this.vertexCount++;
	}

	// Send the vertex data to the graphics card.
	build(shader) {
		// If there were no verticies, there's nothing to do.
		if (this.vertexCount == 0)
            return;

		// Count the number of numbers needed to represent each vertex.
		// By default position takes 3 (x,y,z)
        let floatsPerVertex = 3;
        if (this.hasColor)
            floatsPerVertex += 3;
        if (this.hasTexture)
            floatsPerVertex += 2;

		// Create the vertex array object.
        this.handle = ext.createVertexArrayOES();
        ext.bindVertexArrayOES(this.handle);

		// Send data.
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.STATIC_DRAW);

		// Create vertex attributes.
        let offset = 0;
        this.positionAttributeLocation = shader.getAttributeLocation("position");
        gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, gl.FALSE, floatsPerVertex * Float32Array.BYTES_PER_ELEMENT, offset);
		// The offset of the next vertex attribute from the start of the data for this vertex must advance by the size of the position information (3)
        offset += 3;

        if (this.hasColor) {
            this.colorAttributeLocation = shader.getAttributeLocation("color");
            gl.vertexAttribPointer(this.colorAttributeLocation, 3, gl.FLOAT, gl.FALSE, floatsPerVertex * Float32Array.BYTES_PER_ELEMENT, offset * Float32Array.BYTES_PER_ELEMENT);
            offset += 3;
        }

        if (this.hasTexture) {
            this.textureAttributeLocation = shader.getAttributeLocation("texCoord");
            gl.vertexAttribPointer(this.textureAttributeLocation, 2, gl.FLOAT, gl.FALSE, floatsPerVertex * Float32Array.BYTES_PER_ELEMENT, offset * Float32Array.BYTES_PER_ELEMENT);
            offset += 2;
        }
	}

	draw() {
		// If there were no vertices there's nothing to draw.
		if (this.vertexCount == 0)
            return;

        ext.bindVertexArrayOES(this.handle);
        gl.enableVertexAttribArray(this.positionAttributeLocation);
        if (this.hasColor)
            gl.enableVertexAttribArray(this.colorAttributeLocation);
        if (this.hasTexture)
            gl.enableVertexAttribArray(this.textureAttributeLocation);

        gl.drawArrays(this.geometry, 0, this.vertexCount);

        gl.disableVertexAttribArray(this.positionAttributeLocation);
        if (this.hasColor)
            gl.disableVertexAttribArray(this.colorAttributeLocation);
        if (this.hasTexture)
            gl.disableVertexAttribArray(this.textureAttributeLocation);
	}

	cleanUp() {
		ext.deleteVertexArrayOES(this.handle);
        gl.deleteBuffer(this.vbo);
	}

}
