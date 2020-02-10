function bindTranslations(field, bindings) {
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
    bindTranslations('innerText', [
        ['label-name', 'labelName'],
        ['label-url', 'labelUrl'],
        ['label-folder', 'labelFolder'],
        ['dialog-header', 'dialogHeader'],
        ['cmd-add', 'cmdAdd'],
    ]);
    document.title = chrome.i18n.getMessage('windowTitle');
    bindTranslations('title', [
        ['trim-querystring', 'trimQuerystringTitle'],
        ['trim-title-1', 'trimTitle1'],
        ['trim-title-2', 'trimTitle2'],
        ['trim-title-1-2', 'trimTitle12'],
    ]);
}

export {initTrans, bindTranslations};
