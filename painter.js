const { Computer, loadProgram } = require('./intcode');

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

function turnLeft(facing) {
    switch (facing) {
        case UP: return LEFT;
        case LEFT: return DOWN;
        case DOWN: return RIGHT;
        case RIGHT: return UP;
    }
}

function turnRight(facing) {
    switch (facing) {
        case UP: return RIGHT;
        case RIGHT: return DOWN;
        case DOWN: return LEFT;
        case LEFT: return UP;
    }
}

function moveInDirection(facing) {
    switch (facing) {
        case UP: return { x: 0, y: -1 };
        case RIGHT: return { x: 1, y: 0 };
        case DOWN: return { x: 0, y: 1 };
        case LEFT: return { x: -1, y: 0 };
    }
}

const painterSource = loadProgram('painter.intc');
const bot = {
    software: new Computer(painterSource),
    x: 0, y: 0, facing: UP
}

let maxX = 0;
let maxY = 0;
let minX = 0;
let minY = 0;
const area = { '0|0': 1 };
while (!bot.software.completed()) {
    bot.software.stdin(area[`${bot.x}|${bot.y}`] || 0);
    bot.software.go();
    area[`${bot.x}|${bot.y}`] = bot.software.stdout[0];

    if (bot.software.stdout[1] === 0) {
        bot.facing = turnLeft(bot.facing);
    } else {
        bot.facing = turnRight(bot.facing);
    }

    bot.software.flush();
    bot.x += moveInDirection(bot.facing).x;
    bot.y += moveInDirection(bot.facing).y;
    maxX = Math.max(maxX, bot.x);
    maxY = Math.max(maxY, bot.y);
    minX = Math.min(minX, bot.x);
    minY = Math.min(minY, bot.y);
}
console.log(area);
const map = new Array(maxY - minY + 1).fill(0).map(() => new Array(maxX - minX + 1).fill(' '));
for (const key of Object.keys(area)) {
    const [x, y] = key.split('|').map(n => Number(n));
    try {
        map[y - minY][x - minX] = area[key] === 0 ? ' ' : '█';
    } catch(err) {
        console.log(err);
    }
}
console.log(map.map(r => r.join('')).join('\n'));