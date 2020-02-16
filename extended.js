import {Tree} from './lib/tree.js';
import {getSelectValue, retrieveActiveTab} from "./lib/storage.js";
import {bindTranslations} from "./lib/trans.js";
import {createBookmark} from "./lib/bookmark.js";

const Splash = {
    tree: null,
};

function changeFolder(choice) {
    console.log(choice);
}

function createTree() {
    const elementTree = document.getElementById('tree');
    elementTree.style.visibility = 'visible';
    Splash.tree = new Tree(elementTree,
        choice => changeFolder(choice));
    Splash.tree.init(getSelectValue());
}

function initTrans() {
    document.documentElement.setAttribute('lang',
        chrome.i18n.getMessage('@@ui_locale'));
    bindTranslations('innerText', [
        ['cmd-add', 'cmdAdd'],
        ['cmd-cancel', 'cmdCancel'],
    ]);
}

function initFields(tab) {
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

function initForm() {
    retrieveActiveTab(tab => {
        initFields(tab);
    });
}

function init() {
    createTree();
    initTrans();
    initForm();
}
init();
