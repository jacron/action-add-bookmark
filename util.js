function getDelim(s) {
    const words = s.split(' ');
    for (let word of words) {
        if (word.length === 1 && !/[a-zA-Z0-9]/.test(word)) {
            return ' ' + word + ' ';
        }
    }
    return null;
}

function testGetDelim() {
    const s = 'this 1 is a - extraordinary site - indeed';
    const delim = getDelim(s);
    console.log(delim);
    console.log(s.split(delim))
}

testGetDelim();
