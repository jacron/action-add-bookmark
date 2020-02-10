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

function getNode(target) {
    let element = target;
    if (element.tagName === 'SPAN') {
        element = element.parentElement;
    }
    if (element.tagName === 'LI') {
        return element;
    }
    return null;
}

function openNode(node, onChange) {
    if (node && !node.getAttribute('disabled')) {
        onChange(node.id);
        this.removeSelected();
        node.classList.add('selected');
        this.setFolderTitle(node);
        node.focus();
    }
}

/** @param target
 @param state 'expand'|'collapse' */
function toggleNode(target, state) {
    const parent = target
        .parentElement
        .querySelector('.nested');
    const childClasslist = target.classList;

    if (!state) {
        parent.classList.toggle('active');
        childClasslist.toggle('caret-down');
        const ariaExpanded = parent.getAttribute('aria-expanded');
        parent.setAttribute('aria-expanded',
            (ariaExpanded !== 'true').toString());
    } else if (state === 'expand' && !parent.classList ||
        parent.classList.value.indexOf('active') === -1) {
        parent.classList.add('active');
        childClasslist.add('caret-down');
        parent.setAttribute('aria-expanded', 'true');
    } else if (state === 'collapse' && parent.classList &&
        ~parent.classList.value.indexOf('active')) {
        parent.classList.remove('active');
        childClasslist.remove('caret-down');
        parent.setAttribute('aria-expanded', 'false');
    }
}


export {getDelim, getNode, bind, toggleNode, openNode};
