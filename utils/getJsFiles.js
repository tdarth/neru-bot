const fs = require('fs');
const path = require('path');

function getJsFiles(dir) {
    let files = [];
    for (const item of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files = files.concat(getJsFiles(fullPath));
        } else if (fullPath.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
}

module.exports = getJsFiles;