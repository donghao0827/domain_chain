const ref = ["0", "1", "2" ,"3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]
const h2d = function(h) {
    if(h === "") return 0;
    const array = h.toUpperCase().split('');
    return ref.indexOf(array[0]) * 16 + ref.indexOf(array[1]);
}

const d2h = function(d) {
    if(d === 0) return "00";
    const array = [];
    while(Math.floor(d / 16) !== 0) {
        array.unshift(ref[d % 16]);
        d = Math.floor(d / 16);
    }
    array.unshift(ref[d % 16]);
    return array.join('');
}

const a2d = function(a) {
    const len = a.number.length;
    let res = 0;
    if(len === 0) return 0;
    for(let i = 0; i < len; i++) {
        res = res + a.number[i] * (10 ** i);
    }
    return res;
}

module.exports.h2d = h2d;
module.exports.d2h = d2h;
module.exports.a2d = a2d;