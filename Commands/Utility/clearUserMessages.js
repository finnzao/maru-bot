const Discord = require('../../Utils/discordClient');

module.exports = {
    name: 'clear-user-messages',
    description: 'Apaga todas as mensagens de um determinado usuário no canal atual.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            type: Discord.ApplicationCommandOptionType.User,
            description: 'O usuário cujas mensagens serão apagadas',
            required: true,
        },
    ],
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const targetUser = interaction.options.getUser('usuário');
        const targetChannel = interaction.channel;

        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.ManageMessages)) {
            return interaction.editReply({
                content: '❌ Você não tem permissão para apagar mensagens.',
            });
        }

        if (!targetChannel.permissionsFor(interaction.guild.members.me).has(Discord.PermissionsBitField.Flags.ManageMessages)) {
            return interaction.editReply({
                content: `❌ Eu não tenho permissão para apagar mensagens neste canal.`,
            });
        }

        try {
            const fetchedMessages = await targetChannel.messages.fetch({ limit: 100 });
            const userMessages = fetchedMessages.filter(message => message.author.id === targetUser.id);

            if (userMessages.size === 0) {
                return interaction.editReply({
                    content: `❌ Não foram encontradas mensagens de ${targetUser.tag} no canal ${targetChannel}.`,
                });
            }

            await targetChannel.bulkDelete(userMessages, true);

            interaction.editReply({
                content: `✅ Foram apagadas **${userMessages.size}** mensagens de ${targetUser.tag} no canal ${targetChannel}.`,
            });

            if (!process.env.CLEAR_WEBHOOK_URL) {
                console.warn('⚠️ Webhook URL não configurada em .env. Log de exclusão de mensagens não será enviado.');
                return;
            }

            try {
                const webhookClient = new Discord.WebhookClient({
                    url: process.env.CLEAR_WEBHOOK_URL,
                });

                const embed = new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Green)
                    .setTitle('Mensagens de Usuário Apagadas')
                    .addFields(
                        { name: 'Executor', value: `${interaction.user.tag} (ID: ${interaction.user.id})` },
                        { name: 'Usuário Alvo', value: `${targetUser.tag} (ID: ${targetUser.id})` },
                        { name: 'Canal', value: `${targetChannel.name} (ID: ${targetChannel.id})` },
                        { name: 'Quantidade', value: `${userMessages.size}` },
                    )
                    .setTimestamp();

                await webhookClient.send({ embeds: [embed] });
            } catch (webhookError) {
                console.error('Erro ao tentar enviar log para o webhook:', webhookError);
            }
        } catch (error) {
            console.error('Erro ao tentar apagar as mensagens:', error);
            interaction.editReply({
                content: '❌ Ocorreu um erro ao tentar apagar as mensagens. Certifique-se de que as mensagens têm menos de 14 dias de idade.',
            });
        }
    },
};
