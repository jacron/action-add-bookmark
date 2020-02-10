import {choiceFromLocalStorage, storeActiveTab} from './lib/storage.js';
import {initTrans} from './lib/trans.js';
import {initOptions} from "./lib/select.js";
import {initExisting} from "./lib/existing.js";
import {initQueryString} from "./lib/querystring.js";
import {initTrimTitle} from "./lib/trimtitle.js";
import {initListEvents} from "./lib/existing.js";
import {fillForm, initCmd} from "./lib/form.js";
// import {initTreeOptionsEvents} from "./lib/tree-options.js";

function init(tab, choice) {
    storeActiveTab(tab);
    initExisting();
    initTrans();
    fillForm(tab);
    initOptions(choice);
    initCmd();
    initListEvents();
    initQueryString(tab);
    initTrimTitle(tab);
    // initTreeOptionsEvents();
}

document.addEventListener('DOMContentLoaded', function () {
    const choice = choiceFromLocalStorage('-1');
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs) {
        init(tabs[0], choice);
    });
});
