// import config from './config.js';

let nodesFound = null;
let tabUrl = null;

const MSG_EXISTING = 'existing';
const MSG_NEW_EXISTING = 'newExisting';

function setNodesfound(nodes) {
    const items = [];
    for (const node of nodes) {
        items.push({
            title: node.title,
            id: node.id
        })
    }
    nodesFound = items;
    for (const node of nodes) {
        chrome.bookmarks.get(node.parentId, found => {
            nodesFound.filter(nodeFound =>
                nodeFound.id === node.id)[0]
                .parentTitle = found[0].title;
        })
    }
}

function checkExists(url, cb) {
    tabUrl = url;
    chrome.bookmarks.search({url}, nodes => {
        if (nodes.length > 0) {
            chrome.browserAction.setBadgeText({
                text: nodes.length.toString()
            });
            setNodesfound(nodes);
        } else {
            chrome.browserAction.setBadgeText({
                text: ''
            });
            nodesFound = null;
        }
        if (cb) {cb()}
    })
}

function checkActive(tabId) {
    chrome.tabs.get(tabId, tab => checkExists(tab.url));
}

chrome.tabs.onUpdated.addListener(
    (tabId, changeInfo, tab) => {
        checkExists(tab.url)
    });

chrome.tabs.onActivated.addListener(activeInfo => {
    checkActive(activeInfo.tabId);
});

/**
 * listen to popup.js
 * - request: existing
 * - request: newExisting
 */
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    // console.log(req);
    if (req.request) {
        if (req.request === MSG_EXISTING) {
            sendResponse({existing: nodesFound})
        }
        else if (req.request === MSG_NEW_EXISTING) {
            checkExists(tabUrl, () =>
                sendResponse({existing: nodesFound})  // too late
            );
            /** no new response, have to call me again to get the new existing */
            sendResponse({existing: nodesFound}); // see you later
        }
        else {
            sendResponse('invalid request:' + req.request);
        }
    } else {
        sendResponse('no request received');
    }
});
