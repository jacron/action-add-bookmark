const idSplash = 'didhhgjdbdpeolobnbdpjndmhddjeeig';
const MSG_EXISTING = 'existing';
const MSG_NEW_EXISTING = 'newExisting';

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

function tellBookmarksChange() {
    const choice = document.getElementById('select-folder').value;
    chrome.runtime.sendMessage(idSplash, {changedFolder: choice},
        response => console.log(response));
}

function create() {
    const choice = document.getElementById('select-folder').value;
    chrome.bookmarks.create({
        title: document.getElementById('name').value,
        url: document.getElementById('url').value,
        parentId: choice,
    }, () => {
        /** send message to splash */
        tellBookmarksChange();
        /** send message to background.js */
        askExisting(MSG_NEW_EXISTING);
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
    const cmdCloser = document.getElementById('closer');
    cmdButton.addEventListener('click', () => {
        create();
    });
    cmdCloser.addEventListener('click', () => {
        window.close();
    });
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

function initQs(tab) {
    if (~tab.url.indexOf('?')) {
        const qs = document.getElementById('trim-querystring');
        qs.style.visibility = 'visible';
        qs.addEventListener('click', () => {
            globals.inputUrl.value = trimQuerystring(globals.inputUrl.value);
        })
    }
}

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

function initTrans() {
    document.documentElement.setAttribute('lang',
        chrome.i18n.getMessage('@@ui_locale'));
    bindTranslations([
        ['label-name', 'labelName'],
        ['label-url', 'labelUrl'],
        ['dialog-header', 'dialogHeader'],
        ['cmd-add', 'cmdAdd'],
    ]);
    document.title = chrome.i18n.getMessage('windowTitle');
    document.getElementById('trim-querystring').title =
        chrome.i18n.getMessage('trimQuerystringTitle')
}

function existingTrans(count) {
    const header = document.getElementById('header-existing');
    const text = chrome.i18n.getMessage('existingFound');
    header.innerText =  text.replace('@count', count);
}

const delPrefix = 'del_';

function createExistingRow(bm) {
    const row = document.createElement('div');
    const cmdDelete = document.createElement('span');
    cmdDelete.classList.add('cmd-delete');
    const title = document.createElement('span');
    cmdDelete.innerText = 'x';
    cmdDelete.id = delPrefix + bm.id;
    // cmdDelete.addEventListener('click', () => deleteBm(bm));
    title.innerHtml = '<span class="del-row"></span><span class=""></span>';
    title.innerText = bm.parentTitle;
    row.appendChild(cmdDelete);
    row.appendChild(title);
    return row;
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

function deleteBm(id) {
    chrome.bookmarks.remove(id, () => {
        /** send message to splash */
        tellBookmarksChange();

        askExisting(MSG_NEW_EXISTING, response => {
            askExisting(MSG_EXISTING, response => {
                console.log(response);
                if (response && response.existing) { showExisting(response.existing) }
                else { hideExisting() }
            });
        });
    });
}

function initListEvents() {
    const existingList = document.getElementById('existing-list');

    /** event delegation */
    existingList.addEventListener('click', e => {
        if (e.target.classList.value === 'cmd-delete') {
            const id = e.target.id.substr(delPrefix.length);
            deleteBm(id);
        }
    })
}

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

document.addEventListener('DOMContentLoaded', function () {
    const choice = choiceFromLocalStorage('-1');
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(tabs) {
        const tab = tabs[0];
        askExisting(MSG_EXISTING, response => {
                if (response.existing) { showExisting(response.existing) }
                else { hideExisting() }
            });
        initTrans();
        fillForm(tab);
        initOptions(choice);
        initCmd();
        initListEvents();
        initQs(tab);
    });
});
