import {createBookmark} from "./bookmark.js";
import {Tree} from './tree.js';
import {getSelectValue} from "./storage.js";
import {openDialog} from "./dialog.js";

const Splash = {
    tree: null,
};

function fillForm(tab) {
    const inputName = document.getElementById('name');
    const inputUrl = document.getElementById('url');
    inputName.value = tab.title;
    inputName.addEventListener('keyup', e => {
        if (e.code === 'Enter') {
            createBookmark();
        }
    });
    inputUrl.value = tab.url;
    inputUrl.addEventListener('keyup', e => {
        if (e.code === 'Enter') {
            createBookmark();
        }
    });
}

function changeFolder(choice) {
    console.log(choice);
}

function createTree(e) {
    chrome.windows.create({
        url: './tree.html',
        type: 'popup',
        width: 400,
        height: 600
    }, win => console.log(win));
    // const elementTree = document.getElementById('tree');
    // elementTree.style.visibility = 'visible';
    // Splash.tree = new Tree(elementTree,
    //     choice => changeFolder(choice));
    // Splash.tree.init(getSelectValue());
    // console.log(e);
    // openDialog(elementTree, e, 0, -200);
    e.preventDefault();
}

function initCmd() {
    const cmdButton = document.getElementById('cmd-add');
    const cmdCloser = document.getElementById('closer');
    const cmdMore = document.getElementById('cmd-more');

    cmdButton.addEventListener('click', createBookmark);
    cmdCloser.addEventListener('click', () => window.close());
    cmdMore.addEventListener('click', createTree);
}

function initTree(id) {
    if (!id) { id = getSelectValue() }
    Splash.tree.init(id);
}

export {fillForm, initCmd, initTree};
