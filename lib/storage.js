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

function storeActiveTab(tab) {
    const key = config.ACTIVE_TAB;
    StorageArea.set({[key]: tab}, () => {});
}

function retrieveActiveTab(cb) {
    const key = config.ACTIVE_TAB;
    StorageArea.get([key], items => cb(items[key]));
}

export {choiceFromLocalStorage, rootSelectFromSyncStorage,
    getSelectValue, storeActiveTab, retrieveActiveTab};
