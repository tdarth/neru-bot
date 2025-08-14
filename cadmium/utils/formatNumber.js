function formatNumber(number) {
    return Math.min(2147483647, Math.max(-2147483647, number));
}

module.exports = { formatNumber };