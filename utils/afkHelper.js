const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'afk_users.json');

let afkUsers = {};

function loadAfkUsers() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        Object.keys(afkUsers).forEach(key => delete afkUsers[key]);
        Object.assign(afkUsers, parsed);
    } catch (err) {
        Object.keys(afkUsers).forEach(key => delete afkUsers[key]);
        console.error('Could not load afk_users.json:', err);
    }
}

function saveAfkUsers() {
    try {
        fs.writeFileSync(filePath, JSON.stringify(afkUsers, null, 4));
    } catch (err) {
        console.error('Failed to write afk_users.json:', err);
    }
}

function deleteAfkUser(userId) {
    delete afkUsers[userId];
    saveAfkUsers();
}

function setAfkUser(userId, data) {
    afkUsers[userId] = data;
    saveAfkUsers();
}

loadAfkUsers();

module.exports = {
    afkUsers,
    deleteAfkUser,
    setAfkUser
};