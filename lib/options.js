import {isDeadKey, bindKeys} from './util.js';
import {closeAllDialogs} from './dialog.js';

function onOptionsKeydown(e, dialog) {
    const target = e.target;

    function handleAlfaKey(e, target) {
        function nextAlfa(nsibling, alfaKey) {
            while( nsibling &&
            (nsibling.getAttribute('disabled') === 'true'
                || nsibling.tagName === 'HR'
                || (nsibling.innerText && nsibling.innerText[0].toLowerCase() !== alfaKey)
            )) {
                nsibling = nsibling.nextElementSibling;
            }
            return nsibling;
        }

        function findAlfaKeyNodeFromStart(target, alfaKey) {
            let nsibling = dialog.querySelector('div');
            return nextAlfa(nsibling, alfaKey);
        }

        function findAlfaKeyNode(target, alfaKey) {
            let nsibling = target.nextElementSibling;
            return nextAlfa(nsibling, alfaKey);
        }

        const alfaKey = e.key.toLowerCase();
        let tnode = findAlfaKeyNode(target, alfaKey);
        if (!tnode) {
            tnode = findAlfaKeyNodeFromStart(target, alfaKey);
        }
        if (tnode) {
            tnode.focus();
        }
    }

    function handleSpecialKey(e, target) {
        function home() {
            dialog.querySelector('div').focus();
        }

        function end() {
            dialog.querySelector('div:last-child').focus();
            // if (dialog.lastChild.previousSibling) {
            //     // noinspection JSUnresolvedFunction
            //     dialog.lastChild.previousSibling.focus();
            // } else {
            //     dialog.lastChild.focus();
            // }
        }

        function previous() {
            if (target === dialog) {
                end();
            } else {
                let psibling = target.previousElementSibling;
                while (psibling &&
                (psibling.getAttribute('disabled') === 'true'
                    || psibling.tagName === 'HR')) {
                    psibling = psibling.previousElementSibling;
                }
                if (psibling) {
                    psibling.focus();
                } else {
                    end();
                }
            }
        }

        function next() {
            if (target === dialog) {
                home();
            } else {
                let nsibling = target.nextElementSibling;
                while( nsibling &&
                (nsibling.getAttribute('disabled') === 'true'
                    || nsibling.tagName === 'HR')) {
                    nsibling = nsibling.nextElementSibling;
                }
                if (nsibling) {
                    nsibling.focus();
                } else {
                    home();
                }
            }
        }

        bindKeys(e.key, [
            ['ArrowUp', previous],
            ['ArrowDown', next],
            ['Home', home],
            ['End', end],
            [' ', () => target.click()],
            ['Escape', closeAllDialogs],
        ]);
    }

    if (isDeadKey(e)) { return }
    if (e.key === 'Tab') { return }

    if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
        handleAlfaKey(e, target);
    } else {
        handleSpecialKey(e, target);
    }
    e.preventDefault();
}

export {onOptionsKeydown};
