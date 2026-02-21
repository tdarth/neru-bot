function formatUser(user) {
    return `<@!${user.id}> (**${user.username || 'unknown'}**, \`${user.id}\`)`;
}

module.exports = { formatUser };