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

module.exports = {
    Computer,
    loadProgram
}