import {deleteBm} from "./bookmark.js";
import config from '../config.js';

function hideExisting() {
    const existingContainer = document.getElementById('existing');

    existingContainer.style.marginBottom = -26 + 'px';
    existingContainer.style.visibility = 'hidden';
}

function askExisting(request, cb) {
    chrome.runtime.sendMessage({request},
        response => {
            if (cb) {cb(response)}
        });
}

function initExisting() {
    askExisting(config.MSG_EXISTING, response => {
        if (response.existing) { showExisting(response.existing) }
        else { hideExisting() }
    });
}

function updateExisitng() {
    askExisting(config.MSG_NEW_EXISTING, () => {
        askExisting(config.MSG_EXISTING, response => {
            console.log(response);
            if (response && response.existing) { showExisting(response.existing) }
            else { hideExisting() }
        });
    });
}

function createExistingRow(bm) {
    const row = document.createElement('div');
    const cmdDelete = document.createElement('span');
    cmdDelete.classList.add('cmd-delete');
    const title = document.createElement('span');
    cmdDelete.innerText = 'x';
    cmdDelete.id = config.delPrefix + bm.id;
    // cmdDelete.addEventListener('click', () => deleteBm(bm));
    title.innerHtml = '<span class="del-row"></span><span class=""></span>';
    title.innerText = bm.parentTitle;
    row.appendChild(cmdDelete);
    row.appendChild(title);
    return row;
}

function existingTrans(count) {
    const header = document.getElementById('header-existing');
    const text = chrome.i18n.getMessage('existingFound');
    header.innerText =  text.replace('@count', count);
}

function showExisting(existing) {
    const existingContainer = document.getElementById('existing');
    const existingList = document.getElementById('existing-list');

    existingContainer.style.visibility = 'visible';
    existingTrans(existing.length);

    existingList.innerHTML = '';
    for (const bm of existing) {
        existingList.appendChild(createExistingRow(bm));
    }
}

function initListEvents() {
    const existingList = document.getElementById('existing-list');

    /** event delegation */
    existingList.addEventListener('click', e => {
        // noinspection JSUnresolvedVariable
        if (e.target.classList.value === 'cmd-delete') {
            // noinspection JSUnresolvedVariable
            const id = e.target.id.substr(delPrefix.length);
            deleteBm(id);
        }
    })
}

export {askExisting, initExisting, updateExisitng, initListEvents};
