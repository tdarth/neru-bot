async function modifyLevelRolesForUser(member, roles, stackEnabled) {
    const memberRoles = member.roles.cache.map(role => role.id);
    const botHighestRole = member.guild.me.roles.highest;

    const canManageRole = (roleId) => {
        const role = member.guild.roles.cache.get(roleId);
        return role && botHighestRole.position > role.position;
    };

    if (stackEnabled) {
        const rolesToAdd = roles.filter(roleId => !memberRoles.includes(roleId) && canManageRole(roleId));
        const rolesToRemove = memberRoles.filter(roleId => !roles.includes(roleId) && roleId !== member.guild.id && canManageRole(roleId));

        if (rolesToAdd.length) {
            try { await member.roles.add(rolesToAdd); } catch (err) { }
        }
        if (rolesToRemove.length) {
            try { await member.roles.remove(rolesToRemove); } catch (err) { }
        }
    } else {
        if (roles.length === 0) {
            const rolesToRemove = memberRoles.filter(roleId => roleId !== member.guild.id && canManageRole(roleId));
            if (rolesToRemove.length) {
                try { await member.roles.remove(rolesToRemove); } catch (err) { }
            }
        } else {
            const highestRoleId = roles[roles.length - 1];
            const rolesToRemove = memberRoles.filter(roleId => roleId !== highestRoleId && roleId !== member.guild.id && canManageRole(roleId));

            if (rolesToRemove.length) {
                try { await member.roles.remove(rolesToRemove); } catch (err) { }
            }

            if (!memberRoles.includes(highestRoleId) && canManageRole(highestRoleId)) {
                try { await member.roles.add(highestRoleId); } catch (err) { }
            }
        }
    }
}

module.exports = { modifyLevelRolesForUser };