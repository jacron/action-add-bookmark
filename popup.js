const globals = {
    inputName: document.getElementById('name'),
    inputUrl: document.getElementById('url'),
};

function fillForm(tab) {
    globals.inputName.value = tab.title;
    globals.inputName.addEventListener('keyup', e => {
        if (e.code === 'Enter') {
            create();
        }
    });
    globals.inputUrl.value = tab.url;
    globals.inputUrl.addEventListener('keyup', e => {
        if (e.code === 'Enter') {
            create();
        }
    });
    document.getElementById('favicon').src = tab.favIconUrl;
}

function create() {
    const choice = choiceFromLocalStorage('-1');
    chrome.bookmarks.create({
        title: document.getElementById('name').value,
        url: document.getElementById('url').value,
        parentId: choice
    }, () => window.close())

}

function initOptions(id) {
    const select = document.getElementById('select-folder');
    chrome.bookmarks.getTree(results => {
        createSelect(select, results, id, choice => {
            localStorage.setItem(config.STORAGE_TARGET_FOLDER, choice);
        })
    });
}

function initCmd() {
    const cmdButton = document.getElementById('cmd-add');
    cmdButton.addEventListener('click', () => {
        create();
    })
}
function choiceFromLocalStorage(deflt) {
    const storedId = localStorage.getItem(config.STORAGE_TARGET_FOLDER);
    return storedId || deflt;
}

function trimQuerystring(s) {
    const pos = s.indexOf('?');
    if (~pos) {
        globals.inputUrl.focus();
        return s.substr(0, pos);
    }
    return s;
}

function initQs() {
    const qs = document.getElementById('trim-querystring');
    qs.addEventListener('click', () => {
        globals.inputUrl.value = trimQuerystring(globals.inputUrl.value);
    })
}

document.addEventListener('DOMContentLoaded', function () {
    const choice = choiceFromLocalStorage('-1');
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs) {
        const tab = tabs[0];
        // console.log(tab);
        fillForm(tab);
        initOptions(choice);
        initCmd();
        initQs();
    });
});
