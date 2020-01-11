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
    // document.getElementById('favicon').src = tab.favIconUrl;
}

function create() {
    const choice = choiceFromLocalStorage('-1');
    chrome.bookmarks.create({
        title: document.getElementById('name').value,
        url: document.getElementById('url').value,
        parentId: choice
    }, () => {
        chrome.runtime.sendMessage('didhhgjdbdpeolobnbdpjndmhddjeeig',
            {changedFolder: choice},
            response => console.log(response));
        window.close();
    })
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

// function initQs() {
//     const qs = document.getElementById('trim-querystring');
//     qs.addEventListener('click', () => {
//         globals.inputUrl.value = trimQuerystring(globals.inputUrl.value);
//     })
// }
function bindTranslations(bindings) {
    for (const binding of bindings) {
        const [id, name] = binding;
        const element = document.getElementById(id);
        if (element) {
            const translation = chrome.i18n.getMessage(name);
            if (!translation) {
                console.error('translation not found:', name);
            } else {
                element.innerText = translation;
            }
        } else {
            console.error('id not found:', id);
        }
    }
}

function initTrans(tab) {
    bindTranslations([
        ['label-name', 'labelName'],
        ['label-url', 'labelUrl'],
        ['dialog-header', 'dialogHeader'],
        ['cmd-add', 'cmdAdd'],
    ]);
    document.title = chrome.i18n.getMessage('windowTitle');
    // document.getElementById('trim-querystring').title =
    //     chrome.i18n.getMessage('trimQuerystringTitle')
}

function showExisting(existing) {
    const existingContainer = document.getElementById('existing');
    // console.log(existing);
    if (existing.length > 0) {
        const header = document.createElement('div');
        header.classList.add('header-existing');
        const text = chrome.i18n.getMessage('existingFound');
        // header.innerText =  `${text}: (${existing.length})`;
        header.innerText =  text + ':';
        existingContainer.appendChild(header);
        for (const bm of existing) {
            const row = document.createElement('div');
            row.innerText = ` - ${bm.parentTitle}`;
            existingContainer.appendChild(row);
        }
    }
}

function askExisting() {
    chrome.runtime.sendMessage({request:'existing'},
        response => {
            if (response.existing) { showExisting(response.existing) }
        })
}

document.addEventListener('DOMContentLoaded', function () {
    const choice = choiceFromLocalStorage('-1');
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs) {
        const tab = tabs[0];
        askExisting();
        initTrans();
        fillForm(tab);
        initOptions(choice);
        initCmd();
        // initQs();
    });
});
