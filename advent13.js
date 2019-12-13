const { Computer, loadProgram } = require('./intcode');

const EMPTY = 0;
const WALL = 1;
const BLOCK = 2;
const PADDLE = 3;
const BALL = 4;

function parseScreen(stdout, screen = {}) {
    for (let i = 2; i < stdout.length; i += 3) {
        if (stdout[i - 2] === -1 || stdout[i - 1] === 0) {
            screen.score = stdout[i];
        } else if (stdout[i] === WALL || stdout[i] === BLOCK) {
            // screen[stdout[i]].push({ x: stdout[i - 2], y: stdout[i - 1] }); // don't care about the actual game state for this challenge
        } else {
            screen[stdout[i]] = { x: stdout[i - 2], y: stdout[i - 1] };
        }
    }

    return screen;
}

const cabinet = new Computer(loadProgram('arcade.intc'));
let screen = {};

do {
    cabinet.go();
    screen = parseScreen(cabinet.stdout, screen);
    cabinet.flush();
    if (screen[PADDLE].x < screen[BALL].x) cabinet.stdin(1);
    else if (screen[PADDLE].x > screen[BALL].x) cabinet.stdin(-1);
    else cabinet.stdin(0);
    console.log(screen.score);
} while (!cabinet.completed());

debugger;