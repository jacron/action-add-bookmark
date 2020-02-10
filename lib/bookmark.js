import config from '../config.js';
import {askExisting, updateExisitng} from "./existing.js";

function tellBookmarksChange() {
    const choice = document.getElementById('select-folder').value;
    chrome.runtime.sendMessage(config.idSplash, {changedFolder: choice},
        response => console.log(response));
}

function createBookmark() {
    const choice = document.getElementById('select-folder').value;
    chrome.bookmarks.create({
        title: document.getElementById('name').value,
        url: document.getElementById('url').value,
        parentId: choice,
    }, () => {
        /** send message to splash */
        tellBookmarksChange();
        /** send message to background.js */
        askExisting(config.MSG_NEW_EXISTING);
        window.close();
    })
}

function deleteBm(id) {
    chrome.bookmarks.remove(id, () => {
        /** send message to splash */
        tellBookmarksChange();
        updateExisitng();
    });
}

export {createBookmark, deleteBm};
