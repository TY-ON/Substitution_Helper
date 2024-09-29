// zip two arrays
function zip(a, b) {
    if (typeof a !== "object" || typeof b !== "object") {
        return [];
    };
    let len = 0;
    if (a.length > b.length){
        len = b.length;
    }
    else {
        len = a.length;
    }
    let result = [];
    for (let i = 0; i < len; i++) {
        result.push([a[i], b[i]]);
    }
    return result;
}

function replaceAt(string, index, replacement) {
    return string.substring(0, index) + replacement + string.substring(index + replacement.length);
}

export { zip, replaceAt };