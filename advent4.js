function increasing(n) {
    const digs = n.split('');
    for (let i = 0; i < digs.length - 1; i ++) {
        if (digs[i] > digs[i + 1]) return false;
    }
    return true;
}

function repeatingDigit(n) {
    const match = n.match(/(\d)\1{1,}/g);
    if (!match) return false;
    return match.some(m => m.length === 2);
}

let count = 0;
for (let i = 234208; i <= 765869; i ++) {
    const pass = i.toFixed(0);
    if (increasing(pass) && repeatingDigit(pass)) {
        console.log(pass);
        count ++;
    }
}
console.log(count);