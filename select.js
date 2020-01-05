/** create select with options */
function createOption(child, select) {
    const option = document.createElement('option');
    select.appendChild(option);
    option.innerText = child.title;
    option.value = child.id;
}

function recurCreateOptions(children, select) {
    for (const child of children) {
        if (child.children) {
            createOption(child, select);
            recurCreateOptions(child.children, select);
        }
    }
}

function createSelect(select, results, id, cb) {
    select.addEventListener('change', (e) => {
        cb(e.target.value);
    });
    select.innerHTML = '';
    const root = results[0];
    recurCreateOptions(root.children, select);
    select.value = id;
}

