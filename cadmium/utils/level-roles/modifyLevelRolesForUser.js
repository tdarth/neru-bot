async function modifyLevelRolesForUser(member, roles, stackEnabled) {
    const memberRoles = member.roles.cache.map(role => role.id);

    if (stackEnabled) {
        const rolesToAdd = roles.filter(roleId => !memberRoles.includes(roleId));
        const rolesToRemove = memberRoles.filter(roleId => !roles.includes(roleId) && roleId !== member.guild.id);

        if (rolesToAdd.length) await member.roles.add(rolesToAdd);
        if (rolesToRemove.length) await member.roles.remove(rolesToRemove);
    } else {
        if (roles.length === 0) {
            const rolesToRemove = memberRoles.filter(roleId => roleId !== member.guild.id);
            if (rolesToRemove.length) await member.roles.remove(rolesToRemove);
        } else {
            const highestRoleId = roles[roles.length - 1];
            const rolesToRemove = memberRoles.filter(roleId => roleId !== highestRoleId && roleId !== member.guild.id);
            if (rolesToRemove.length) await member.roles.remove(rolesToRemove);
            if (!memberRoles.includes(highestRoleId)) await member.roles.add(highestRoleId);
        }
    }
}

module.exports = { modifyLevelRolesForUser };