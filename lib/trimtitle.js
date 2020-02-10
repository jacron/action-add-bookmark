import {getDelim} from './util.js';

function initTrimTitle(tab) {
    const delim = getDelim(tab.title);
    if (delim) {
        const tt1 = document.getElementById('trim-title-1');
        const tt2 = document.getElementById('trim-title-2');
        const tt12 = document.getElementById('trim-title-1-2');
        const title = document.getElementById('name');
        tt1.style.visibility = 'visible';
        tt2.style.visibility = 'visible';
        tt12.style.visibility = 'visible';
        tt1.addEventListener('click', e => {
            let parts = tab.title.split(delim);
            title.value = parts[0];
            e.preventDefault();
            return false;
        });
        tt2.addEventListener('click', e => {
            let parts = tab.title.split(delim);
            title.value = parts[1];
            e.preventDefault();
            return false;
        });
        tt12.addEventListener('click', e=> {
            title.value = tab.title;
            e.preventDefault();
            return false;
        })
    }
}

export {initTrimTitle};
