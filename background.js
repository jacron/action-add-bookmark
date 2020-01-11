let nodesFound = null;

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
        // console.log(node.parentId);
        chrome.bookmarks.get(node.parentId, found => {
            nodesFound.filter(nodeFound =>
                nodeFound.id === node.id)[0]
                .parentTitle = found[0].title;
        })
    }
}

function checkExists(url) {
    chrome.bookmarks.search({url}, nodes => {
        // console.log('found nodes', nodes);
        if (nodes.length > 0) {
            chrome.browserAction.setBadgeText({
                text: nodes.length.toString()
            });
            // chrome.browserAction.setPopup({
            //     popup: 'popup2.html'
            // });
            setNodesfound(nodes);
        } else {
            chrome.browserAction.setBadgeText({
                text: ''
            });
            nodesFound = null;
        }
    })
}

function chackActive(tabId) {
    chrome.tabs.get(tabId, tab => checkExists(tab.url));
}

chrome.tabs.onUpdated.addListener(
    (tabId, changeInfo, tab) => {
        checkExists(tab.url)
    });
chrome.tabs.onActivated.addListener(activeInfo => {
    chackActive(activeInfo.tabId);
});
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.request && req.request === 'existing') {
        sendResponse({existing: nodesFound})
    }
});
