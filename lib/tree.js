import {rootSelectFromSyncStorage} from './storage.js';
import config from '../config.js';
import {initTree} from "./form.js";

// import {initBookmarks} from "./bookmarks.js";
// import {initTree} from "./main.js";
// import {openTreeOptionsDialog} from "./tree-options.js";

class Tree {
    constructor(element, onChange) {
        this.tree = element;
        this._first = true;
        this.onChange = onChange;
        this.initTreeDelegateEvents();
    }

    init(id) {
        rootSelectFromSyncStorage(choice => {
            if (!choice || choice === '0' || choice === 0) {
                chrome.bookmarks.getTree(results =>
                    this.createTree(results, id));
            } else {
                chrome.bookmarks.getSubTree(choice.toString(), results =>
                {
                    this.createTree(results, id);
                });
            }
        });
    }

    createLi(child) {
        const template = document.getElementById('node-template');
        const li = template.cloneNode(true);
        const opener = li.querySelector('.opener');
        const name = li.querySelector('.name');
        name.innerText = child.title;
        li.appendChild(opener);
        li.appendChild(name);
        li.id = child.id;
        li.setAttribute('tabindex', -1);
        li.setAttribute('role', 'treeitem');
        return li;
    }

    createNestedUl() {
        const ul = document.createElement('ul');
        ul.classList.add('nested');
        ul.setAttribute('role', 'group');
        ul.setAttribute('aria-expanded', 'false');
        return ul;
    }

    hasGrandChildren(node) {
        for (const child of node.children) {
            if (child.children) { return true }
        }
        return false;
    }

    recurCreateTreeNodes(node, ul) {
        if (node.children) {
            const li = this.createLi(node);
            ul.appendChild(li);
            if (this.hasGrandChildren(node)) {
                li.querySelector('.opener')
                    .classList.add('caret');
                ul = this.createNestedUl();
                li.appendChild(ul);
            }
            if (this._first) {
                const caret = li.querySelector('.caret');
                this.toggleNode(caret, 'expand');
                li.setAttribute('tabindex', 0);
                this._first = false;
            }
            for (const child of node.children) {
                this.recurCreateTreeNodes(child, ul);
            }
        }
    }

    createTree(results, id) {
        console.log('results', results);
        treeVars.treeNodesRef = results;  // needed by re-ordering
        this.tree.innerHTML = '';
        this._first = true;
        const root = results[0];
        this.recurCreateTreeNodes(root, this.tree);
        this.setTreeChoice(id);
    }

    removeSelected() {
        const tree = document.getElementById('tree');
        const elements = tree.querySelectorAll('.selected');
        for (let i = 0; i < elements.length; i++) {
            elements[i].classList.remove('selected');
        }
    }

    /** @param target
     @param state 'expand'|'collapse' */
    toggleNode(target, state) {
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

    getNode(target) {
        let element = target;
        if (element.tagName === 'SPAN') {
            element = element.parentElement;
        }
        if (element.tagName === 'LI') {
            return element;
        }
        return null;
    }

    openParentLis(li) {
        const selector = 'li.opener';
        let closestOpener = li.parentElement.closest(selector);
        do {
            if (closestOpener) {
                const caret = closestOpener.querySelector('.caret');
                if (caret) {
                    //openNode(caret);
                    this.toggleNode(caret, 'expand');
                }
                closestOpener = closestOpener.parentElement.closest(selector);
            }
        } while (closestOpener !== null);
    }

    setFolderTitle(node) {
        if (!node) {
            console.error('empty node');
            return;
        }
        const folders = [];
        folders.push(node.querySelector('.name').innerText);
        const selector = 'li.opener';
        let closestOpener = node.parentElement.closest(selector);
        do {
            if (closestOpener) {
                const caret = closestOpener.querySelector('.caret');
                if (caret) {
                    folders.push(closestOpener.querySelector('.name').innerText);
                }
                closestOpener = closestOpener.parentElement.closest(selector);
            }
        } while (closestOpener !== null);

        /** skip root folder */
        folders.pop();

        let s = '';
        do {
            if (s.length > 0) {
                s += '/';
            }
            s += folders.pop();
        } while (folders.length > 0);
        if (s === 'undefined') { s = '' }
        document.getElementById('current-folder-name').innerText = s;
    }

    setTreeChoice(id) {
        const tree = document.getElementById('tree');
        const lis = tree.querySelectorAll('li');
        this.removeSelected(tree);
        let li;

        for (let i = 0; i < lis.length; i++) {
            li = lis[i];
            if (li.id === id) {
                this.openParentLis(li);
                li.classList.add('selected');
                li.focus();
                break;
            }
        }
        this.setFolderTitle(li);
    }

    openNode(node, onChange) {
        if (node && !node.getAttribute('disabled')) {
            onChange(node.id);
            this.removeSelected();
            node.classList.add('selected');
            this.setFolderTitle(node);
            node.focus();
        }
    }

    handleSpecialKey(e, onChange) {
        const node = this.getNode(e.target);
        // console.log(node);
        switch(e.key) {
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
                    this.toggleNode(rcaret, 'expand');
                }
                break;
            case 'ArrowLeft':
                const lcaret = node.querySelector('.caret');
                if (lcaret) {
                    this.toggleNode(lcaret, 'collapse');
                }
                break;
            case ' ':
            case 'Enter':
                this.openNode(node, onChange);
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
        } while(hnode && hnode.nextSibling);
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
        const node = this.getNode(e.target);
        const alfaKey = e.key.toLowerCase();
        let tnode = this.findAlfaKeyNode(node, alfaKey);
        if (!tnode) {
            tnode = this.findAlfaKeyNodeFromStart(node, alfaKey);
        }
        if (tnode) {
            tnode.focus();
        }
    }

    onTreeKeydown(e) {
        // console.log(e);
        const deadkeys = ['altKey', 'ctrlKey', 'metaKey'];
        for (const key of deadkeys) {
            if (e[key]) { return }
        }
        if (~['Alt', 'Control', 'Meta'].indexOf(e.key)) { return }
        if (e.key === 'Tab') { return }

        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
            this.handleAlfaKey(e);
        } else {
            this.handleSpecialKey(e, this.onChange);
        }
        e.preventDefault();
    }

    onTreeClick(e) {
        const target = e.target;
        if (~target.classList.value.indexOf('caret')) {
            this.toggleNode(target);
        } else {
            const node = this.getNode(target);
            this.openNode(node, this.onChange);
        }
        document.getElementById('tree').focus();
    }

     processTreeDrop(textData, parentId) {
        if (textData.startsWith(config.BM_CLIPBOARD_PREFIX)) {
            const bmId = textData.substr(config.BM_CLIPBOARD_PREFIX.length);
            chrome.bookmarks.move(bmId,{parentId});
            // initBookmarks();
            initTree(); /** dropped item may be a folder */
        }
        if (textData.startsWith(config.NODE_CLIPBOARD_PREFIX)) {
            const nodeId = textData.substr(config.NODE_CLIPBOARD_PREFIX.length);
            chrome.bookmarks.move(nodeId, {parentId});
            initTree();
        }
    }

    onTreeDrop(e) {
        const node = this.getNode(e.target);
        const textData = e.dataTransfer.getData('text');
        const nodeId = textData.substr(config.NODE_CLIPBOARD_PREFIX.length);
        if (node && node.id !== nodeId) {
            e.preventDefault();
            node.classList.remove('tree-draggedover');
            this.processTreeDrop(textData, node.id);
        } else {
            /** it was dropped onto itself */
            node.classList.remove('tree-draggedover');
        }
    }

    onTreeDragover(e) {
        e.preventDefault();
        const node = this.getNode(e.target);
        if (node) {
            node.classList.add('tree-draggedover');
        }
    }

    onTreeDragleave(e) {
        e.preventDefault();
        const node = this.getNode(e.target);
        if (node) {
            node.classList.remove('tree-draggedover');
        }
    }

    // onTreeContextmenu(e) {
    //     const node = this.getNode(e.target);
    //     if (node) {
    //         if (!node.getAttribute('disabled')) {
    //             openTreeOptionsDialog(e, node);
    //         }
    //         e.preventDefault();
    //     }
    // }

    onTreeDragstart(e) {
        const node = this.getNode(e.target);
        if (node) {
            e.dataTransfer.setData('text',
                config.NODE_CLIPBOARD_PREFIX + node.id);
        }
    }

    initTreeDelegateEvents() {
        this.tree.addEventListener('click', this.onTreeClick.bind(this));
        this.tree.addEventListener('keydown', this.onTreeKeydown.bind(this));

        const bindings = [
            ['dragover', this.onTreeDragover.bind(this)],
            ['dragleave', this.onTreeDragleave.bind(this)],
            ['dragstart', this.onTreeDragstart.bind(this)],
            ['drop', this.onTreeDrop.bind(this)],
            // ['contextmenu', this.onTreeContextmenu.bind(this)],
        ];
        for (const [type, listener] of bindings) {
            this.tree.addEventListener(type, listener);
        }
    }
}

const treeVars = {
    treeNodesRef: null,
};

export {Tree};
