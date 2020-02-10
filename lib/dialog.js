function hideDialogBackground() {
    const dialogBackground = document.getElementById('dialog-background');
    dialogBackground.style.visibility = 'hidden';
}

function showDialogBackground() {
    const dialogBackground = document.getElementById('dialog-background');
    dialogBackground.style.visibility = 'visible';
}

function openDialog(dialog, e, xOffset, yOffset) {
    showDialogBackground();
    let x = e.pageX;
    if (xOffset) x += xOffset;
    let y = e.pageY;
    if (yOffset) y += yOffset;
    if (x === 0) {
        x = 400;
        y = 140;
    }
    dialog.style.display = 'block';
    const rect = dialog.getBoundingClientRect();
    if (x + rect.width > window.innerWidth) {
        x -= x + rect.width - window.innerWidth + 10;
    }
    if (y + rect.height > window.innerHeight) {
        y -= y + rect.height - window.innerHeight + 10;
    }
    dialog.style.top = window.scrollY + y + 'px';
    dialog.style.left = window.scrollX + x + 'px';
}

function removeEdited() {
    const edited = document.querySelectorAll('.edited');
    for (let i = 0; i < edited.length; i++) {
        edited[i].classList.remove('edited');
    }
}

function closeAllDialogs() {
    const dialogs = [
        'bookmark-dialog',
        'new-folder-dialog',
        'bookmark-options-dialog',
        'tree-options',
        'dialog-general-options',
        'dialog-choose-root',
        'new-bookmark-dialog',
        'bm-list-options',
    ];
    for (const dialog of dialogs) {
        const element = document.getElementById(dialog);
        if (!element) {
            console.error('id not found:', dialog);
        }
        element.style.display = 'none';
    }
    removeEdited();
    hideDialogBackground();
    // todo: mousemove listener should be removed
    // onBackgroundMouseoverFocus('remove');
}

function initDialogsCloser() {
    const dialogBackground =
        document.getElementById('dialog-background');

    dialogBackground.addEventListener('click', e => {
        closeAllDialogs();
        e.preventDefault();
    });
    dialogBackground.addEventListener('contextmenu', e => {
        closeAllDialogs();
        e.preventDefault();
    });
}

export {closeAllDialogs, showDialogBackground, openDialog, initDialogsCloser,
    removeEdited, hideDialogBackground};
