const Discord = require('../../Utils/discordClient');
const { roles } = require('../../config');

module.exports = {
    name: 'interactionCreate',
    execute: async (interaction) => {
        // Verificar se a interação é de um botão
        if (!interaction || !interaction.isButton || !interaction.isButton()) {
            return; // Interrompe se a interação não for de botão
        }

        // Verificar se o ID do botão é 'toggle_notification'
        if (interaction.customId === 'toggle_notification') {
            const member = interaction.guild.members.cache.get(interaction.user.id);
            const notificationRole = roles.notificationRole;

            if (!member) {
                return interaction.reply({ content: '❌ Não foi possível encontrar seu perfil no servidor.', ephemeral: true });
            }

            try {
                if (member.roles.cache.has(notificationRole)) {
                    // Se o usuário já tem o cargo, remover
                    await member.roles.remove(notificationRole);
                    await interaction.reply({ content: '🔕 Você não receberá mais notificações.', ephemeral: true });
                } else {
                    // Caso contrário, adicionar o cargo
                    await member.roles.add(notificationRole);
                    await interaction.reply({ content: '🔔 Você receberá notificações.', ephemeral: true });
                }
            } catch (error) {
                console.error('Erro ao adicionar/remover cargo de notificação:', error);
                interaction.reply({ content: '❌ Ocorreu um erro ao tentar adicionar/remover o cargo de notificação. Tente novamente mais tarde.', ephemeral: true });
            }
        }
    },
};
