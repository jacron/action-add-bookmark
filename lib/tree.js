import {rootSelectFromSyncStorage} from './storage.js';
import config from '../config.js';
import {initTree} from "./form.js";
import {TreeKey} from "./tree-key.js";
import {getNode, toggleNode, openNode} from "./util.js";

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
        console.log(this._second);
        if (this._second) {
            li.setAttribute('tabindex', 4);
            this._second = false;
        } else {
            li.setAttribute('tabindex', -1);
        }
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
            if (!this._first) {
                const li = this.createLi(node);
                ul.appendChild(li);
                if (this.hasGrandChildren(node)) {
                    li.querySelector('.opener')
                        .classList.add('caret');
                    ul = this.createNestedUl();
                    li.appendChild(ul);
                }
            }
            if (this._first) {
                this._first = false;
                this._second = true;
            }
            // if (this._second) { this._second = false }
            for (const child of node.children) {
                this.recurCreateTreeNodes(child, ul);
            }
        }
    }

    createTree(results, id) {
        treeVars.treeNodesRef = results;  // needed by re-ordering
        this.tree.innerHTML = '';
        this._first = true;
        this._second = true;
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

    openParentLis(li) {
        const selector = 'li.opener';
        let closestOpener = li.parentElement.closest(selector);
        do {
            if (closestOpener) {
                const caret = closestOpener.querySelector('.caret');
                if (caret) {
                    //openNode(caret);
                    toggleNode(caret, 'expand');
                }
                closestOpener = closestOpener.parentElement.closest(selector);
            }
        } while (closestOpener !== null);
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
    }

    onTreeClick(e) {
        const target = e.target;
        if (~target.classList.value.indexOf('caret')) {
            toggleNode(target);
        } else {
            const node = getNode(target);
            openNode(node, this.onChange);
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
        const node = getNode(e.target);
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
        const node = getNode(e.target);
        if (node) {
            node.classList.add('tree-draggedover');
        }
    }

    onTreeDragleave(e) {
        e.preventDefault();
        const node = getNode(e.target);
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
        const node = getNode(e.target);
        if (node) {
            e.dataTransfer.setData('text',
                config.NODE_CLIPBOARD_PREFIX + node.id);
        }
    }

    onTreeKeydown(e) {
        const treeKeys = new TreeKey();
        treeKeys.onTreeKeydown(e, this.onChange);
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
