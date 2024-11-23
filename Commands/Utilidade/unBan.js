const Discord = require('../../Utils/discordClient');
const { webhooks } = require('../../config');

module.exports = {
    name: 'unban',
    description: 'Desbanir um usuário pelo ID.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'user_id',
            type: Discord.ApplicationCommandOptionType.String,
            description: 'O ID do usuário a ser desbanido',
            required: true,
        },
        {
            name: 'motivo',
            type: Discord.ApplicationCommandOptionType.String,
            description: 'Motivo do desbanimento',
            required: false,
        },
    ],
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';

        // Verificar se o executor tem permissão para desbanir membros
        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.BanMembers)) {
            return interaction.editReply({
                content: '❌ Você não tem permissão para desbanir membros.',
            });
        }

        // Verificar se o bot tem permissão para desbanir membros
        if (!interaction.guild.members.me.permissions.has(Discord.PermissionsBitField.Flags.BanMembers)) {
            return interaction.editReply({
                content: '❌ Eu não tenho permissão para desbanir membros.',
            });
        }

        try {
            // Buscar a lista de banimentos do servidor
            const banList = await interaction.guild.bans.fetch();
            const bannedUser = banList.find(ban => ban.user.id === userId);

            // Verificar se o usuário está realmente banido
            if (!bannedUser) {
                return interaction.editReply({
                    content: '❌ O ID especificado não pertence a um usuário banido neste servidor.',
                });
            }

            // Realizar o desbanimento do usuário
            await interaction.guild.members.unban(userId, reason);

            interaction.editReply({
                content: `✅ Usuário com ID **${userId}** foi desbanido com sucesso. Motivo: **${reason}**`,
            });

            // Log para o webhook
            const webhookClient = new Discord.WebhookClient({
                url: roles.banWebhook, // Certifique-se de que esta URL é válida
            });

            const embed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Green)
                .setTitle('Usuário Desbanido')
                .addFields(
                    { name: 'Executor', value: `${interaction.user.tag} (ID: ${interaction.user.id})` },
                    { name: 'Usuário Desbanido (ID)', value: `${userId}` },
                    { name: 'Motivo', value: reason }
                )
                .setTimestamp();

            await webhookClient.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao desbanir o usuário:', error);
            interaction.editReply({
                content: '❌ Ocorreu um erro ao tentar desbanir o usuário. Verifique se o ID fornecido está correto.',
            });
        }
    },
};
