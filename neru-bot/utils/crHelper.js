const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'custom_roles.json');

let customRoles = {};

function loadCustomRoles() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(data);
        Object.keys(customRoles).forEach(key => delete customRoles[key]);
        Object.assign(customRoles, parsed);
    } catch (err) {
        Object.keys(customRoles).forEach(key => delete customRoles[key]);
        console.error('Could not load custom_roles.json:', err);
    }
}

function saveCustomRoles() {
    try {
        fs.writeFileSync(filePath, JSON.stringify(customRoles, null, 4));
    } catch (err) {
        console.error('Failed to write afk_users.json:', err);
    }
}

function deleteCustomRoleEntry(userId) {
    delete customRoles[userId];
    saveCustomRoles();
}

function setCustomRoleEntry(userId, data) {
    customRoles[userId] = data;
    saveCustomRoles();
}

loadCustomRoles();

module.exports = {
    customRoles,
    deleteCustomRoleEntry,
    setCustomRoleEntry
};