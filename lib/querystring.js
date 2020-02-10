function trimQuerystring(s) {
    const inputUrl = document.getElementById('url');
    const pos = s.indexOf('?');
    if (~pos) {
        inputUrl.focus();
        return s.substr(0, pos);
    }
    return s;
}

function initQueryString(tab) {
    const inputUrl = document.getElementById('url');
    if (~tab.url.indexOf('?')) {
        const qs = document.getElementById('trim-querystring');
        qs.style.visibility = 'visible';
        qs.addEventListener('click', e => {
            inputUrl.value = trimQuerystring(inputUrl.value);
            e.preventDefault();
            return false;
        });
    }
}

export {initQueryString};
