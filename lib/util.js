function getDelim(s) {
    const words = s.split(' ');
    for (let word of words) {
        if (word.length === 1 && !/[a-zA-Z0-9]/.test(word)) {
            return ' ' + word + ' ';
        }
    }
    return null;
}

function bind(type, bindings) {
    for (const [id, listener] of bindings) {
        const element = document.getElementById(id);
        if (!element) {
            console.error('id does not exist', id);
        } else {
            element.addEventListener(type, listener);
        }
    }
}

export {getDelim, bind};
