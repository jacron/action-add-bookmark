import {Tree} from './lib/tree.js';
import {getSelectValue} from "./lib/storage.js";

const Splash = {
    tree: null,
};

function changeFolder(choice) {
    console.log(choice);
}

function createTree() {
    const elementTree = document.getElementById('tree');
    elementTree.style.visibility = 'visible';
    Splash.tree = new Tree(elementTree,
        choice => changeFolder(choice));
    Splash.tree.init(getSelectValue());
}

createTree();
