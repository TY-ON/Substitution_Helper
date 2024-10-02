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

    if (typeof a[0] === "object") {
        let result = [...a];
        for (let i = 0; i < len; i++) {
            result[i].push(b[i]);
        }
        return result;
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


function extract_nth(cipher_text, n, bias) {
    let result = "";
    const len = cipher_text.length;

    for (let i = bias; i < len; i+=n) {
        result += cipher_text.substring(i, i+1);
    }
    return result;
}

export { zip, replaceAt, extract_nth };