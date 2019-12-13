const input =
`#.#.###.#.#....#..##.#....
.....#..#..#..#.#..#.....#
.##.##.##.##.##..#...#...#
#.#...#.#####...###.#.#.#.
.#####.###.#.#.####.#####.
#.#.#.##.#.##...####.#.##.
##....###..#.#..#..#..###.
..##....#.#...##.#.#...###
#.....#.#######..##.##.#..
#.###.#..###.#.#..##.....#
##.#.#.##.#......#####..##
#..##.#.##..###.##.###..##
#..#.###...#.#...#..#.##.#
.#..#.#....###.#.#..##.#.#
#.##.#####..###...#.###.##
#...##..#..##.##.#.##..###
#.#.###.###.....####.##..#
######....#.##....###.#..#
..##.#.####.....###..##.#.
#..#..#...#.####..######..
#####.##...#.#....#....#.#
.#####.##.#.#####..##.#...
#..##..##.#.##.##.####..##
.##..####..#..####.#######
#.#..#.##.#.######....##..
.#.##.##.####......#.##.##`;

const puzzle =
`.#....#####...#..
##...##.#####..##
##...#...#.#####.
..#.....X...###..
..#.#...#.#....##`;

const parsed = input.replace('\r\n', '\n').split('\n').map(r => r.split('').map(a => a === '#' ? 1 : 0));
const asteroids = parsed.flatMap((r, y) => r.map((a, x) => a ? { x, y, sees: [] } : null)).filter(v => v != null);
const field = asteroids.reduce((f, a) => ({ ...f, [`${a.x}|${a.y}`]: a }), {});

function gcd(a, b) {
    while (b !== 0) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}

function sign(n) {
    return n < 0 ? -1 : n > 0 ? 1 : 0;
}

function lineOfSight(a1, a2, asteroids, field) {
    const dx = a2.x - a1.x;
    const dy = a2.y - a1.y;
    const div = Math.abs(gcd(dx, dy));
    const stepX = Math.abs(dx / div) * sign(dx);
    const stepY = Math.abs(dy / div) * sign(dy);
    for (let i = 1; i < div; i ++) {
        if (field[`${a1.x + stepX * i}|${a1.y + stepY * i}`]) return false;
    }

    return true;
}

function maxBy(arr, pred) {
    return arr.reduce((best, el) => {
        const val = [pred(el), el];
        return val[0] > best[0] ? val : best;
    }, [-Infinity])[1];
}

const station = { x: 13, y: 17 };
// const station = { x: 8, y: 3 };

function relativeAngle(station, asteroid) {
    const dx = asteroid.x - station.x;
    const dy = asteroid.y - station.y;
    const angle = Math.atan(dy / dx);
    if (dx < 0) return angle + Math.PI * (3/2);
    return angle + Math.PI / 2;
}

function distance(station, asteroid) {
    const dx = asteroid.x - station.x;
    const dy = asteroid.y - station.y;
    return dx * dx + dy * dy;
}

function logsteroids(asteroids, selectFn, width) {
    let l = [];
    for (const asteroid of asteroids) {
        if (asteroid.y >= l.length) {
            l = l.concat(new Array(asteroid.y - l.length + 1).fill(0).map(() => new Array(width).fill(undefined)));
        }
        l[asteroid.y][asteroid.x] = selectFn(asteroid);
    }
    l[station.y][station.x] = 'xxxx';
    return l.map(r => r.map(a => a == undefined ? '    ' : a).join(' ')).join('\n\n');
}

// for (let i = 0; i < asteroids.length - 1; i ++) {
//     for (let j = i + 1; j < asteroids.length; j ++) {
//         if (lineOfSight(asteroids[i], asteroids[j], asteroids, field)) {
//             asteroids[i].sees.push(asteroids[j]);
//             asteroids[j].sees.push(asteroids[i]);
//         }
//     }
// }
// console.log(maxBy(asteroids.map(a => ({ x: a.x, y: a.y, sees: a.sees.length })), a => a.sees));
const asteroidsByAngleAndDistance = asteroids.filter(a => a.x !== station.x || a.y !== station.y).map(a => ({ x: a.x, y: a.y, angle: relativeAngle(station, a) * 180 / Math.PI, distance: distance(station, a) }));
asteroidsByAngleAndDistance.sort((a, b) => a.angle - b.angle || a.distance - b.distance);
for (let i = 1; i < asteroidsByAngleAndDistance.length - 1; i ++) {
    if (asteroidsByAngleAndDistance[i].angle === asteroidsByAngleAndDistance[i - 1].angle) {
        asteroidsByAngleAndDistance.push(asteroidsByAngleAndDistance[i]);
        asteroidsByAngleAndDistance.splice(i, 1);
        i --;
    }
}
// const message = logsteroids(asteroidsByAngleAndDistance, a => ('    ' + a.angle.toFixed(0)).substr(-4, 4), 17);
console.log(asteroidsByAngleAndDistance);

debugger;