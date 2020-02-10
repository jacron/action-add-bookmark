import config from '../config.js';
const StorageArea = chrome.storage.sync;

function choiceFromLocalStorage(deflt) {
    const storedId = localStorage.getItem(config.STORAGE_TARGET_FOLDER);
    return storedId || deflt;
}

function rootSelectFromSyncStorage(cb) {
    const key = config.STORAGE_OTHER_BOOKMARKS;
    StorageArea.get([key], function(items) {
        cb(items[key]);
    });
}

function getSelectValue() {
    /** using localstorage as a kind of global, sic */
    return choiceFromLocalStorage('-1');
}

export {choiceFromLocalStorage, rootSelectFromSyncStorage, getSelectValue};
