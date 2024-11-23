function checkPermissions(interaction, requiredPermissions) {
    if (!interaction.member.permissions.has(requiredPermissions)) {
        return `❌ Você não tem permissão para executar este comando. Requer: ${requiredPermissions}`;
    }
    
    if (!interaction.guild.members.me.permissions.has(requiredPermissions)) {
        return `❌ Eu não tenho permissão para executar esta ação. Requer: ${requiredPermissions}`;
    }
    
    return null; // Se as permissões estão corretas, não há erro.
}

module.exports = { checkPermissions };
