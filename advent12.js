const sign = n => n < 0 ? -1 : n > 0 ? 1 : 0;
const pad = n => n < 0 ? n.toFixed(0) : (' ' + n.toFixed());

class Moon {
    position = { x: 0, y: 0, z: 0 };
    velocity = { x: 0, y: 0, z: 0 };

    constructor(x, y, z) {
        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    applyGravity(other) {
        this.velocity.x += sign(other.position.x - this.position.x);
        this.velocity.y += sign(other.position.y - this.position.y);
        this.velocity.z += sign(other.position.z - this.position.z);
    }

    step() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;
    }

    potential() {
        return Math.abs(this.position.x) + Math.abs(this.position.y) + Math.abs(this.position.z);
    }
    
    kinetic() {
        return Math.abs(this.velocity.x) + Math.abs(this.velocity.y) + Math.abs(this.velocity.z);
    }

    totalEnergy() {
        return this.potential() * this.kinetic();
    }

    toString() {
        return `pos=<x=${pad(this.position.x)}, y=${pad(this.position.y)}, z=${pad(this.position.z)}>, vel=<x=${pad(this.velocity.x)}, y=${pad(this.velocity.y)}, z=${pad(this.velocity.z)}>`
    }

    toEnergyString() {
        return `pot: ${this.potential()}; kin: ${this.kinetic()}; total: ${this.totalEnergy()};`
    }
}

const moons = [
    new Moon(-9, 10, -1),
    new Moon(-14, -8, 14),
    new Moon(1, 5, 6),
    new Moon(-19, 7, 8),
];

const target = [
    new Moon(-9, 10, -1),
    new Moon(-14, -8, 14),
    new Moon(1, 5, 6),
    new Moon(-19, 7, 8),
];

let step = 0;
let axisState = [-1, -1, -1];
do {
    for (let moon of moons) {
        for (let other of moons) {
            if (moon === other) continue;
            moon.applyGravity(other);
        }
    }
    for (let moon of moons) {
        moon.step();
    }
    step ++;
    if (step % 10000000 === 0) console.log(step);
    if (axisState[0] < 0 &&
        moons[0].position.x == target[0].position.x &&
        moons[0].velocity.x == target[0].velocity.x &&
        moons[1].position.x == target[1].position.x &&
        moons[1].velocity.x == target[1].velocity.x &&
        moons[2].position.x == target[2].position.x &&
        moons[2].velocity.x == target[2].velocity.x &&
        moons[3].position.x == target[3].position.x &&
        moons[3].velocity.x == target[3].velocity.x
    ) {
        axisState[0] = step;
        console.log('found x axis', step);
    }
    if (axisState[1] < 0 &&
        moons[0].position.y == target[0].position.y &&
        moons[0].velocity.y == target[0].velocity.y &&
        moons[1].position.y == target[1].position.y &&
        moons[1].velocity.y == target[1].velocity.y &&
        moons[2].position.y == target[2].position.y &&
        moons[2].velocity.y == target[2].velocity.y &&
        moons[3].position.y == target[3].position.y &&
        moons[3].velocity.y == target[3].velocity.y
    ) {
        axisState[1] = step;
        console.log('found y axis', step);
    }
    if (axisState[2] < 0 &&
        moons[0].position.z == target[0].position.z &&
        moons[0].velocity.z == target[0].velocity.z &&
        moons[1].position.z == target[1].position.z &&
        moons[1].velocity.z == target[1].velocity.z &&
        moons[2].position.z == target[2].position.z &&
        moons[2].velocity.z == target[2].velocity.z &&
        moons[3].position.z == target[3].position.z &&
        moons[3].velocity.z == target[3].velocity.z
    ) {
        axisState[2] = step;
        console.log('found z axis', step);
    }
} while (
    axisState[0] < 0 ||
    axisState[1] < 0 ||
    axisState[2] < 0
);

console.log(axisState);