async function modifyLevelRolesForUser(member, roles, stackEnabled) {
    const memberRoles = member.roles.cache.map(role => role.id);

    if (stackEnabled) {
        const rolesToAdd = roles.filter(roleId => !memberRoles.includes(roleId));
        const rolesToRemove = memberRoles.filter(roleId => !roles.includes(roleId) && roleId !== member.guild.id);

        if (rolesToAdd.length) {
            try {
                await member.roles.add(rolesToAdd);
            } catch {}
        }
        if (rolesToRemove.length) {
            try {
                await member.roles.remove(rolesToRemove);
            } catch {}
        }
    } else {
        if (roles.length === 0) {
            const rolesToRemove = memberRoles.filter(roleId => roleId !== member.guild.id);
            if (rolesToRemove.length) {
                try {
                    await member.roles.remove(rolesToRemove);
                } catch {}
            }
        } else {
            const highestRoleId = roles[roles.length - 1];
            const rolesToRemove = memberRoles.filter(roleId => roleId !== highestRoleId && roleId !== member.guild.id);
            if (rolesToRemove.length) {
                try {
                    await member.roles.remove(rolesToRemove);
                } catch {}
            }
            if (!memberRoles.includes(highestRoleId)) {
                try {
                    await member.roles.add(highestRoleId);
                } catch {}
            }
        }
    }
}

module.exports = { modifyLevelRolesForUser };