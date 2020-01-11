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
    const choice = document.getElementById('select-folder').value;
    chrome.bookmarks.create({
        title: document.getElementById('name').value,
        url: document.getElementById('url').value,
        parentId: choice,
    }, () => {
        chrome.runtime.sendMessage('didhhgjdbdpeolobnbdpjndmhddjeeig',
            {changedFolder: choice},
            response => console.log(response));
        window.close();
    })
}

function save() {
    const choice = document.getElementById('select-folder').value;
    chrome.bookmarks.update({
        title: document.getElementById('name').value,
        url: document.getElementById('url').value,
        parentId: choice,
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
    const cmdCloser = document.getElementById('closer');
    const cmdEdit = document.getElementById('cmd-edit');
    cmdButton.addEventListener('click', () => {
        create();
    });
    cmdCloser.addEventListener('click', () => {
        window.close();
    });
    cmdEdit.addEventListener('click', () => {
        save();
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
    document.documentElement.setAttribute('lang',
        chrome.i18n.getMessage('@@ui_locale'));
    bindTranslations([
        ['cmd-edit', 'cmdEdit'],
        ['choice-edit-label', 'choiceEditLabel'],
        ['choice-add-label', 'choiceAddLabel'],
        ['prompt-existing', 'promptExisting'],
        ['more', 'more'],
    ]);
    document.title = chrome.i18n.getMessage('windowTitle');
    document.getElementById('trim-querystring').title =
        chrome.i18n.getMessage('trimQuerystringTitle');
    const header = document.getElementById('.header-existing');
    const text = chrome.i18n.getMessage('existingFound');
    header.innerText =  text.replace('@count', count);
}

function prepareForm(form) {
    const cmdEdit = document.getElementById('cmd-edit');
    const cmdAdd = document.getElementById('cmd-add');

    form.addEventListener('change', () => {
        if (form.choice.value === 'edit') {
            cmdAdd.style.visibility = 'hidden';
            cmdEdit.style.visibility = 'visible';
        } else {
            cmdEdit.style.visibility = 'hidden';
            cmdAdd.style.visibility = 'visible';
        }
    });
    form.choice.value= "add";
    cmdEdit.style.visibility = 'hidden';

}

function showExisting(existing) {
    const existingContainer = document.getElementById('existing');
    const existingList = document.getElementById('existing-list');

    existingContainer.style.visibility = 'visible';
    existingTrans(existing.length);
    prepareForm(document['form-choice']);

    if (existing.length > 0) {
        for (const bm of existing) {
            const row = document.createElement('div');
            row.innerText = ` - ${bm.parentTitle}`;
            existingList.appendChild(row);
        }
    }
}

function hideExisting() {
    const existingContainer = document.getElementById('existing');
    const cmdEdit = document.getElementById('cmd-edit');

    existingContainer.style.marginBottom = -26 + 'px';
    cmdEdit.style.visibility = 'hidden';
    document['form-choice'].style.display = 'none'; /** prevent height */
    existingContainer.style.visibility = 'hidden';
}

function askExisting() {
    chrome.runtime.sendMessage({request:'existing'},
        response => {
            if (response.existing) { showExisting(response.existing) }
            else { hideExisting() }
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
        initQs(tab);
    });
});
