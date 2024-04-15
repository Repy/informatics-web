function isSosuu(i) {
    for (var index = 2; index < i; index++) {
        if (i % index === 0) {
            return false;
        }
    }
    return true;
}

function getSosuu(count) {
    var ret = [];
    for (var index = 2; index < Number.MAX_SAFE_INTEGER && ret.length < count; index++) {
        if (isSosuu(index)) {
            ret.push(index);
        }
    }
    return ret;
}
