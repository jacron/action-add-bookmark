function fillForm(tab) {
    document.getElementById('name').value = tab.title;
    document.getElementById('url').value = tab.url;
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
            title: document.getElementById('name').value,
            url: document.getElementById('url').value,
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
        fillForm(tabs[0]);
        initOptions(choice);
        initCmd(tabs[0]);
    });
});
