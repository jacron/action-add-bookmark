function useTab(tab) {
    const rowName = document.getElementById('name');
    const rowUrl = document.getElementById('url');
    rowUrl.innerText = tab.url;
    rowName.innerText = tab.title;
}

function initOptions(id) {
    const select = document.getElementById('select-folder');
    chrome.bookmarks.getTree(results => {
        createSelect(select, results, id, choice => {
            /* handle user choice of folder */
            // displayChoiceAndBookmarks(choice);
            localStorage.setItem(config.STORAGE_TARGET_FOLDER, choice);
        })
    });
}

function initCmd(tab) {
    const cmdButton = document.getElementById('cmd-add');
    cmdButton.addEventListener('click', () => {
        const choice = choiceFromLocalStorage('-1');
        chrome.bookmarks.create({
            url: tab.url,
            title: tab.title,
            parentId: choice
        }, () => window.close())
    })
}
function choiceFromLocalStorage(deflt) {
    const storedId = localStorage.getItem(config.STORAGE_TARGET_FOLDER);
    return storedId || deflt;
}

document.addEventListener('DOMContentLoaded', function () {
    const choice = choiceFromLocalStorage('-1');
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs) {
        // const url = tabs[0].url;
        // console.log(tabs[0]);
        useTab(tabs[0]);
        initOptions(choice);
        initCmd(tabs[0]);
    });
});
