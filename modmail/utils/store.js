const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data.json");
const TMP_PATH = DB_PATH + ".tmp";

let db;

function emptyDb() {
    return {
        tickets: { byUser: {}, byChannel: {} },
        banned: {},
        messageAssociations: { byUser: {}, byEmbed: {} },
    };
}

function init() {
    if (fs.existsSync(DB_PATH)) {
        try {
            const raw = fs.readFileSync(DB_PATH, "utf8");
            db = JSON.parse(raw);

            db.tickets ??= { byUser: {}, byChannel: {} };
            db.tickets.byUser ??= {};
            db.tickets.byChannel ??= {};
            db.banned ??= {};
            db.messageAssociations ??= { byUser: {}, byEmbed: {} };
            db.messageAssociations.byUser ??= {};
            db.messageAssociations.byEmbed ??= {};
        } catch (err) {
            console.error("[MODMAIL] Store: Failed to parse data.json, starting with empty:", err.message);
            db = emptyDb();
        }
    } else {
        db = emptyDb();
        _flushSync();
    }
}

let _dirty = false;
let _writing = false;
let _writeQueue = Promise.resolve();

function _scheduleSave() {
    _dirty = true;
    _writeQueue = _writeQueue.then(_drainIfDirty).catch((err) => {
        console.error("[MODMAIL] Store: Write error:", err);
    });
}

async function _drainIfDirty() {
    if (!_dirty || _writing) return;
    _dirty = false;
    _writing = true;
    try {
        await _flushAsync();
    } finally {
        _writing = false;
        if (_dirty) {
            _writeQueue = _writeQueue.then(_drainIfDirty);
        }
    }
}

function _flushSync() {
    const json = JSON.stringify(db, null, 2);
    fs.writeFileSync(TMP_PATH, json, "utf8");
    fs.renameSync(TMP_PATH, DB_PATH);
}

async function _flushAsync() {
    const json = JSON.stringify(db, null, 2);
    await fs.promises.writeFile(TMP_PATH, json, "utf8");
    await fs.promises.rename(TMP_PATH, DB_PATH);
}

const k = (...parts) => parts.join(":");

function getChannelByUser(guildId, userId) {
    return db.tickets.byUser[k(guildId, userId)] ?? null;
}

function getUserByChannel(guildId, channelId) {
    return db.tickets.byChannel[k(guildId, channelId)] ?? null;
}

function addUserToChannel(guildId, channelId, userId) {
    const uKey = k(guildId, userId);
    const cKey = k(guildId, channelId);

    if (db.tickets.byUser[uKey] !== undefined) return;

    db.tickets.byUser[uKey] = channelId;
    db.tickets.byChannel[cKey] = userId;
    _scheduleSave();
}

function removeUserFromChannel(guildId, channelId, userId) {
    const uKey = k(guildId, userId);
    const cKey = k(guildId, channelId);

    if (db.tickets.byUser[uKey] === undefined) return;

    delete db.tickets.byUser[uKey];
    delete db.tickets.byChannel[cKey];
    _scheduleSave();
}

function clearChannel(guildId, channelId) {
    const cKey = k(guildId, channelId);
    const userId = db.tickets.byChannel[cKey];

    if (userId === undefined) return;

    delete db.tickets.byChannel[cKey];
    delete db.tickets.byUser[k(guildId, userId)];
    _scheduleSave();
}

function updateUserChannel(guildId, newChannelId, userId) {
    const uKey = k(guildId, userId);
    const oldChannelId = db.tickets.byUser[uKey];

    if (oldChannelId === undefined) return;

    delete db.tickets.byChannel[k(guildId, oldChannelId)];

    db.tickets.byUser[uKey] = newChannelId;
    db.tickets.byChannel[k(guildId, newChannelId)] = userId;
    _scheduleSave();
}

function addBannedUser(guildId, userId, reason = null) {
    const key = k(guildId, userId);
    const existing = db.banned[key];
    db.banned[key] = {
        reason,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    _scheduleSave();
}

function removeBannedUser(guildId, userId) {
    const key = k(guildId, userId);
    if (db.banned[key] === undefined) return;
    delete db.banned[key];
    _scheduleSave();
}

function isUserBanned(guildId, userId) {
    const entry = db.banned[k(guildId, userId)];
    if (entry) return { banned: true, reason: entry.reason };
    return { banned: false, reason: null };
}

function associateMessageToEmbed(userMessageId, embedMessageId, modmailChannelId) {
    const uKey = k(modmailChannelId, userMessageId);
    const eKey = k(modmailChannelId, embedMessageId);

    const oldEmbedId = db.messageAssociations.byUser[uKey];
    if (oldEmbedId !== undefined) {
        delete db.messageAssociations.byEmbed[k(modmailChannelId, oldEmbedId)];
    }

    db.messageAssociations.byUser[uKey] = embedMessageId;
    db.messageAssociations.byEmbed[eKey] = userMessageId;
    _scheduleSave();
}

function getEmbedMessageFromUser(userMessageId, modmailChannelId) {
    return db.messageAssociations.byUser[k(modmailChannelId, userMessageId)] ?? null;
}

function getUserMessageFromEmbed(embedMessageId, modmailChannelId) {
    return db.messageAssociations.byEmbed[k(modmailChannelId, embedMessageId)] ?? null;
}

function clearMessageAssociations(modmailChannelId) {
    const prefix = modmailChannelId + ":";

    for (const key of Object.keys(db.messageAssociations.byUser)) {
        if (key.startsWith(prefix)) {
            const embedId = db.messageAssociations.byUser[key];
            delete db.messageAssociations.byUser[key];
            delete db.messageAssociations.byEmbed[k(modmailChannelId, embedId)];
        }
    }
    _scheduleSave();
}

module.exports = {
    init,

    getChannelByUser,
    getUserByChannel,
    addUserToChannel,
    removeUserFromChannel,
    clearChannel,
    updateUserChannel,

    addBannedUser,
    removeBannedUser,
    isUserBanned,

    associateMessageToEmbed,
    getEmbedMessageFromUser,
    getUserMessageFromEmbed,
    clearMessageAssociations,
};