import {getNode, toggleNode, openNode} from "./util.js";

class TreeKey {
    handleSpecialKey(e, onChange) {
        const node = getNode(e.target);
        // console.log(node);
        switch (e.key) {
            case 'ArrowUp':
                let psibling = node.previousSibling;
                if (psibling) {
                    const nested = psibling.querySelector('.nested.active');
                    if (nested) {
                        // noinspection JSUnresolvedFunction
                        nested.lastChild.focus();
                    } else {
                        psibling.focus();
                    }
                } else {
                    // noinspection JSUnresolvedFunction
                    node.parentNode.closest('.opener').focus();
                }

                break;
            case 'ArrowDown':
                const nested = node.querySelector('.nested.active');
                if (nested) {
                    nested.querySelector('.opener').focus();
                } else {
                    let nsibling = node.nextSibling;
                    if (nsibling) {
                        nsibling.focus();
                    } else {
                        const parent = node.parentNode.parentNode;
                        nsibling = parent.nextSibling;
                        if (nsibling) {
                            nsibling.focus();
                        }
                    }
                }
                break;
            case 'Home':
                let hnode = node;
                while (hnode.previousSibling) {
                    hnode = hnode.previousSibling;
                }
                hnode.focus();
                break;
            case 'End':
                let tnode = node;
                while (tnode.nextSibling) {
                    tnode = tnode.nextSibling;
                }
                tnode.focus();
                break;
            case 'ArrowRight':
                const rcaret = node.querySelector('.caret');
                if (rcaret) {
                    toggleNode(rcaret, 'expand');
                }
                break;
            case 'ArrowLeft':
                const lcaret = node.querySelector('.caret');
                if (lcaret) {
                    toggleNode(lcaret, 'collapse');
                }
                break;
            case ' ':
            case 'Enter':
                openNode(node, onChange);
                break;
            default:
                break;
        }
    }

    findAlfaKeyNodeFromStart(node, alfaKey) {
        let hnode = node;
        while (hnode.previousSibling) {
            hnode = hnode.previousSibling;
        }
        do {
            if (hnode
                .querySelector('.name')
                .innerText[0]
                .toLowerCase() === alfaKey) {
                return hnode;
            }
            hnode = hnode.nextSibling;
        } while (hnode && hnode.nextSibling);
        return null;
    }

    findAlfaKeyNode(tnode, alfaKey) {
        while (tnode.nextSibling) {
            if (tnode
                .nextSibling
                .querySelector('.name')
                .innerText[0]
                .toLowerCase() === alfaKey) {
                return tnode.nextSibling;
            } else {
                tnode = tnode.nextSibling;
            }
        }
        return null;
    }

    handleAlfaKey(e) {
        const node = getNode(e.target);
        const alfaKey = e.key.toLowerCase();
        let tnode = this.findAlfaKeyNode(node, alfaKey);
        if (!tnode) {
            tnode = this.findAlfaKeyNodeFromStart(node, alfaKey);
        }
        if (tnode) {
            tnode.focus();
        }
    }

    onTreeKeydown(e, onChange) {
        const deadkeys = ['altKey', 'ctrlKey', 'metaKey'];
        for (const key of deadkeys) {
            if (e[key]) {
                return
            }
        }
        if (~['Alt', 'Control', 'Meta'].indexOf(e.key)) {
            return
        }
        if (e.key === 'Tab') {
            return
        }

        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
            this.handleAlfaKey(e);
        } else {
            this.handleSpecialKey(e, onChange);
        }
        e.preventDefault();
    }
}

export {TreeKey};
