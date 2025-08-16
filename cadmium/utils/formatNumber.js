function formatNumber(number, range = 2147483647) {
    return Math.min(range, Math.max(-range, number));
}

module.exports = { formatNumber };