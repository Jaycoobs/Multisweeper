/**
* Represents a vector in two dimensions.
**/
class Vec2 {

    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(other) { return new Vec2(this.x + other.x, this.y + other.y); }
    sub(other) { return new Vec2(this.x - other.x, this.y - other.y); }
    scale(s) { return new Vec2(this.x * s, this.y * s); }
    mul(other) { return new Vec2(this.x * other.x, this.y * other.y); }
    dot(other) { return this.x * other.x + this.y * other.y; }
    unit() { return this.scale(1/this.length()); };
    length() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    length2() { return this.x * this.x + this.y * this.y; }
    distance(other) { return this.sub(other).length(); }
    angle(other) {
        let a = Math.acos(this.dot(other)/this.length()/other.length());
        return (other.x > this.x) ? a : 2*Math.PI-a;
    };
    standardAngle() { return Math.acos(this.y / this.length()); }

}
