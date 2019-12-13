const fs = require('fs');

const l = fs.readFileSync('data.dat', 'ascii').split('\r\n').map(ll => ll.split(')'));
const map = {};

for (const ll of l) {
    map[ll[1]] = ll[0];
}

function orbits(key) {
    if (!map[key]) return 0;
    return 1 + orbits(map[key]);
}

function hopup(key) {
    if (!map[key]) return [];
    return hopup(map[key]).concat([map[key]])
}

function dist(a, b) {
    const l1 = hopup(a);
    const l2 = hopup(b);
    const l1p = l1.filter(e => !l2.includes(e));
    const l2p = l2.filter(e => !l1.includes(e));
    return l1p.length + l2p.length;
}

console.log(dist('YOU', 'SAN'));