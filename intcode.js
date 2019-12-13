const { readFileSync } = require('fs');

const ADD = 1;
const MULT = 2;
const INPUT = 3;
const OUTPUT = 4;
const JIT = 5;
const JIF = 6;
const LT = 7;
const EQ = 8;
const SET_RBO = 9;
const HALT = 99;

const POSITION = 0;
const IMMEDIATE = 1;
const RELATIVE = 2;

function opcode(opcode) {
    return opcode % 100;
}

function readMode(opcode, position) {
    return Math.floor(opcode / (100 * (10 ** position))) % 10;
}

function param(code, pc, rbo, position) {
    const mode = readMode(code[pc], position);
    if (mode === POSITION) {
        return code[code[pc + position + 1]] || 0;
    } else if (mode === IMMEDIATE) {
        return code[pc + position + 1] || 0;
    } else if (mode === RELATIVE) {
        return code[code[pc + position + 1] + rbo] || 0;
    } else {
        throw new Error(`Invalid readmode ${mode} in instruction ${code[pc]} at ${pc}`);
    }
}

function writeTo(code, pc, rbo, position, value) {
    const mode = readMode(code[pc], position);
    if (mode === POSITION) {
        code[code[pc + position + 1]] = value;
    } else if (mode === RELATIVE) {
        return code[code[pc + position + 1] + rbo] = value;
    } else {
        throw new Error(`Invalid writemode ${mode} in instruction ${code[pc]} at ${pc}`);
    }
}

const log = v => console.log(v);

function run(code, stdin = [], stdout = log, pc = 0, rbo = 0) {
    code = code.slice();
    let ic = 0;
    while (code[pc] !== HALT) {
        switch (opcode(code[pc])) {
            case ADD: {
                writeTo(code, pc, rbo, 2, param(code, pc, rbo, 0) + param(code, pc, rbo, 1));
                pc += 4;
                break;
            }
            case MULT: {
                writeTo(code, pc, rbo, 2, param(code, pc, rbo, 0) * param(code, pc, rbo, 1));
                pc += 4;
                break;
            }
            case INPUT: {
                if (ic >= stdin.length) return { code, pc, rbo };
                writeTo(code, pc, rbo, 0, stdin[ic ++]);
                pc += 2;
                break;
            }
            case OUTPUT: {
                stdout(param(code, pc, rbo, 0));
                pc += 2;
                break;
            }
            case JIT: {
                if (param(code, pc, rbo, 0) !== 0) {
                    pc = param(code, pc, rbo, 1);
                } else {
                    pc += 3;
                }
                break;
            }
            case JIF: {
                if (param(code, pc, rbo, 0) === 0) {
                    pc = param(code, pc, rbo, 1);
                } else {
                    pc += 3;
                }
                break;
            }
            case LT: {
                if (param(code, pc, rbo, 0) < param(code, pc, rbo, 1)) {
                    writeTo(code, pc, rbo, 2, 1);
                } else {
                    writeTo(code, pc, rbo, 2, 0);
                }
                pc += 4;
                break;
            }
            case EQ: {
                if (param(code, pc, rbo, 0) === param(code, pc, rbo, 1)) {
                    writeTo(code, pc, rbo, 2, 1);
                } else {
                    writeTo(code, pc, rbo, 2, 0);
                }
                pc += 4;
                break;
            }
            case SET_RBO: {
                rbo += param(code, pc, rbo, 0);
                pc += 2;
                break;
            }
            default: {
                throw new Error('Unknown op code');
            }
        }
        if (pc >= code.length) {
            throw new Error('segfault');
        }
    }
    return { code, pc: -1, rbo };
}

function loadProgram(filename) {
    return readFileSync(filename, 'ascii').split(',').map(n => Number(n));
}

function permute(sequence) {
    if (sequence.length < 2) return sequence;
    return sequence.flatMap((e, i) => permute(sequence.filter((_, ip) => i !== ip)).map(seq => [e].concat(seq)));
}

function maxBy(arr, predicate) {
    return arr.reduce((acc, el) => {
        const val = predicate(el);
        return val > acc[0] ? [val, el] : acc
    }, [-Infinity])[1];
}

class Computer {
    input = [];
    stdout = [];

    constructor(code) {
        this.programState = {
            code,
            pc: 0,
            rbo: 0
        }
    }

    stdin(v) {
        this.input.push(v);
    }

    flush() {
        this.stdout = [];
    }

    go() {
        this.programState = run(this.programState.code, this.input, v => this.stdout.push(v), this.programState.pc, this.programState.rbo);
        this.input = [];
    }

    completed() {
        return this.programState.pc < 0;
    }
}

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

debugger;