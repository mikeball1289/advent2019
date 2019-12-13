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

module.exports = {
    permute,
    maxBy
}