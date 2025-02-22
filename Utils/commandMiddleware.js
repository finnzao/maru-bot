const { PermissionsBitField } = require('discord.js');
const { getMemberPermissionLevel } = require('./permissionCheck');

/**
 * Middleware para verificar permissões antes da execução de comandos.
 * 
 * @param {Object} options - Opções de verificação
 * @param {Array} [options.requiredLevels] - Lista de níveis de permissão personalizados (Maxima, Media, Baixa)
 * @param {Array} [options.requiredPermissions] - Lista de permissões do Discord (ex.: Administrator, BanMembers)
 */
function checkPermission({ requiredLevels = [], requiredPermissions = [] }) {
  return async (client, interaction, next) => {
    // Verifica permissões baseadas em cargos (sistema customizado)
    if (requiredLevels.length > 0) {
      const userLevel = getMemberPermissionLevel(interaction.member);
      if (!requiredLevels.includes(userLevel)) {
        return interaction.reply({
          content: '❌ Você não tem permissão suficiente para executar este comando.',
          ephemeral: true
        });
      }
    }

    // Verifica permissões nativas do Discord
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        interaction.member.permissions.has(PermissionsBitField.Flags[permission])
      );

      if (!hasAllPermissions) {
        return interaction.reply({
          content: '❌ Você não tem as permissões necessárias para executar este comando.',
          ephemeral: true
        });
      }
    }

    // Se passou nas verificações, executa o próximo middleware ou comando
    await next();
  };
}

module.exports = {
  checkPermission
};
