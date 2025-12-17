const fs = require('fs');
const path = require('path');
const cachePath = path.join(__dirname, '../dataCache.json');

let cache = fs.existsSync(cachePath)
    ? JSON.parse(fs.readFileSync(cachePath))
    : {};

function getDataCache(key) {
    return cache[key];
}

function setDataCache(key, value) {
    cache[key] = value;
    fs.writeFileSync(cachePath, JSON.stringify(cache));
}

module.exports = { getDataCache, setDataCache }