function bindTranslations(bindings, field) {
    for (const binding of bindings) {
        const [id, name] = binding;
        const element = document.getElementById(id);
        if (element) {
            const translation = chrome.i18n.getMessage(name);
            if (!translation) {
                console.error('translation not found:', name);
            } else {
                element[field] = translation;
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
        ['label-folder', 'labelFolder'],
        ['dialog-header', 'dialogHeader'],
        ['cmd-add', 'cmdAdd'],
    ], 'innerText');
    document.title = chrome.i18n.getMessage('windowTitle');
    bindTranslations([
        ['trim-querystring', 'trimQuerystringTitle'],
        ['trim-title-1', 'trimTitle1'],
        ['trim-title-2', 'trimTitle2'],
        ['trim-title-1-2', 'trimTitle12'],
    ], 'title');
}

export {initTrans};
