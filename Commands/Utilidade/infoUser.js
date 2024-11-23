const Discord = require('../../Utils/discordClient');

module.exports = {
    name: 'user-info',
    description: 'Mostra informações detalhadas sobre um usuário.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            type: Discord.ApplicationCommandOptionType.User,
            description: 'O usuário para obter informações',
            required: true,
        },
    ],
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false }); 
        const targetUser = interaction.options.getUser('usuário');
        const member = interaction.guild.members.cache.get(targetUser.id);

        if (!member) {
            return interaction.editReply({
                content: '❌ Não consegui encontrar o usuário especificado no servidor.',
            });
        }

        // Informações básicas
        const joinedAt = member.joinedAt ? `<t:${Math.floor(member.joinedAt / 1000)}:R>` : 'Data não encontrada';
        const createdAt = `<t:${Math.floor(targetUser.createdAt / 1000)}:R>`;
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .map(role => role.name)
            .join(', ') || 'Nenhum cargo';

        // Informações adicionais
        const boostSince = member.premiumSince ? `<t:${Math.floor(member.premiumSince / 1000)}:R>` : 'Não está boostando';
        const status = member.presence?.status ? member.presence.status : 'offline';

        try {
            const embed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Blue)
                .setTitle(`Informações do Usuário: ${targetUser.tag}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
                .addFields(
                    { name: 'Nome do Usuário', value: `${targetUser.tag} (ID: ${targetUser.id})`, inline: false },
                    { name: 'Conta Criada Em', value: `${createdAt}`, inline: true },
                    { name: 'Entrou no Servidor Em', value: `${joinedAt}`, inline: true },
                    { name: 'Cargos', value: roles, inline: false },
                    { name: 'Status', value: status.charAt(0).toUpperCase() + status.slice(1), inline: true },
                    { name: 'Boostando Desde', value: boostSince, inline: true }
                )
                .setFooter({ text: `Pedido por: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.editReply({
                content: '❌ Ocorreu um erro ao tentar obter informações do usuário.',
            });
        }
    },
};
