const config = {
    Avax: 'http://localhost:3008/safari?url=',
};

function makeUrl(url) {
    return config.Avax + url;
}

function callUrl(url) {
    fetch(url).then(result => console.info(result)).catch(err => console.error(err));
}

