import {createBookmark} from "./bookmark.js";
import {getSelectValue, storeActiveTab} from "./storage.js";

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

function openExtended(e) {
    storeActiveTab()
    chrome.windows.create({
        url: './extended.html',
        type: 'popup',
        width: 400,
        height: 600
    }, win => console.log(win));
    e.preventDefault();
}

function initCmd() {
    const cmdButton = document.getElementById('cmd-add');
    const cmdCloser = document.getElementById('closer');
    const cmdMore = document.getElementById('cmd-more');

    cmdButton.addEventListener('click', createBookmark);
    cmdCloser.addEventListener('click', () => window.close());
    cmdMore.addEventListener('click', openExtended);
}

function initTree(id) {
    if (!id) { id = getSelectValue() }
    Splash.tree.init(id);
}

export {fillForm, initCmd, initTree};
