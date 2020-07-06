class LineModel {

	constructor() {
		this.thickness = 0.07;
		this.vao = new VAO(gl.TRIANGLES);
		this.offset = new Vec2();
	}

	setOffset(offset)  { this.offset = offset; }

	readData(data) {
		for (let i = 0; i < data.length; i += 7) {
            let ax = data[i];
            let ay = data[i+1];
            let bx = data[i+2];
            let by = data[i+3];
            let r = data[i+4];
            let g = data[i+5];
            let b = data[i+6];
            this.addLine(ax, ay, bx, by, r, g, b);
        }
	}

	addLine(x1, y1, x2, y2, red, green, blue) {
		let a = new Vec2(x1, y1).add(this.offset);
        let b = new Vec2(x2, y2).add(this.offset);
        let d = b.sub(a).unit();
        let p = new Vec2(-d.y, d.x).scale(this.thickness);

        let al = a.sub(p);
        let ar = a.add(p);
        let bl = b.sub(p);
        let br = b.add(p);

        //this.vao.setColor([red * this.tint[0], green * this.tint[1], blue * this.tint[2]]);
        this.vao.addVertex([al.x, al.y]);
        this.vao.addVertex([ar.x, ar.y]);
        this.vao.addVertex([bl.x, bl.y]);

        this.vao.addVertex([bl.x, bl.y]);
        this.vao.addVertex([ar.x, ar.y]);
        this.vao.addVertex([br.x, br.y]);
	}

	build(shader) { this.vao.build(shader); }

	render() { this.vao.draw(this.getShader()); }

	cleanUp() { this.vao.cleanUp(); }

}
