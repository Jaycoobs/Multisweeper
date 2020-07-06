/**
* Represents a shader program running on the graphics card.
**/
class Shader {

	constructor(vertexText, fragmentText) {
		this.vertexText = vertexText;
		this.fragmentText = fragmentText;
	}

	init() {
		this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
		this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

		gl.shaderSource(this.vertexShader, this.vertexText);
        gl.shaderSource(this.fragmentShader, this.fragmentText);

        gl.compileShader(this.vertexShader);
        if (!gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS)) {
            console.error("Failed to compile vertex shader! ", gl.getShaderInfoLog(this.vertexShader));
            return false;
        }

        gl.compileShader(this.fragmentShader);
        if (!gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS)) {
            console.error("Failed to compile fragment shader! ", gl.getShaderInfoLog(this.fragmentShader));
            return false;
        }

        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, this.vertexShader);
        gl.attachShader(this.shaderProgram, this.fragmentShader);
        gl.linkProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            console.error("Failed to link shader program! ", gl.getProgramInfoLog(this.shaderProgram));
            return false;
        }

        gl.validateProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.VALIDATE_STATUS)) {
            console.error("Failed to validate program! ", gl.getProgramInfoLog(this.shaderProgram));
            return false;
        }

        return true;
	}

	bind() { gl.useProgram(this.shaderProgram); Shader.currentShader = this; }

	getAttributeLocation(name) { return gl.getAttribLocation(this.shaderProgram, name); }

	getUniformLocation(name) { return gl.getUniformLocation(this.shaderProgram, name); }

	setUniformMat4(location, mat) { gl.uniformMatrix4fv(location, gl.FALSE, mat); }

	setUniformFloat(location, f) { gl.uniform1f(location, f); }

	setUniformBool(location, b) { gl.uniform1i(location, b ? 1 : 0); }

	setUniformVec3(location, v) { gl.uniform3fv(location, v); }

}

// Default shader programs
const defaultVertexShaderSource =
`

precision mediump float;

attribute vec3 position;
attribute vec2 texCoord;

uniform mat4 viewMatrix;

varying vec2 passTexCoord;

void main() {
    passTexCoord = texCoord;
    gl_Position = viewMatrix * vec4(position, 1.0);
}

`;

const defaultFragmentShaderSource =
`

precision mediump float;

uniform sampler2D texture;

varying vec2 passTexCoord;

void main() {
    gl_FragColor = texture2D(texture, passTexCoord);
}

`;
