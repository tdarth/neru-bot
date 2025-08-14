function toMySQLDate(timestamp) {
    const d = new Date(timestamp);
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

function fromMySQLDate(sqlDate) {
    return new Date(sqlDate).getTime();
}

module.exports = { toMySQLDate, fromMySQLDate };