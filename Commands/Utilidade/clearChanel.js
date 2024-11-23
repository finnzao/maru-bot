const Discord = require('../../Utils/discordClient');
const { checkPermissions } = require('../../Utils/permissionUtils');

module.exports = {
    name: 'clear-messages',
    description: 'Limpa mensagens do canal atual.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'quantidade',
            type: Discord.ApplicationCommandOptionType.Integer,
            description: 'Quantidade de mensagens a serem apagadas (1-100)',
            required: true,
            minValue: 1,
            maxValue: 100,
        },
    ],
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true }); // Deferindo para ganhar mais tempo

        const deleteAmount = interaction.options.getInteger('quantidade');
        const targetChannel = interaction.channel;

        // Verificar se o usuário tem permissão para gerenciar mensagens
        const requiredPermissions = Discord.PermissionsBitField.Flags.ManageMessages;
        const permissionError = checkPermissions(interaction, requiredPermissions);
        if (permissionError) {
            return interaction.editReply({
                content: permissionError,
            });
        }

        // Verificar se o bot tem permissão para gerenciar mensagens
        if (!targetChannel.permissionsFor(interaction.guild.members.me).has(Discord.PermissionsBitField.Flags.ManageMessages)) {
            return interaction.editReply({
                content: `❌ Eu não tenho permissão para gerenciar mensagens neste canal.`,
            });
        }

        try {
            // Buscar e deletar as mensagens
            const fetchedMessages = await targetChannel.messages.fetch({ limit: deleteAmount });
            await targetChannel.bulkDelete(fetchedMessages, true);

            interaction.editReply({
                content: `✅ Foram apagadas **${fetchedMessages.size}** mensagens deste canal.`,
            });

            // Log para o webhook
            const webhookClient = new Discord.WebhookClient({
                url: process.env.CLEAR_WEBHOOK_URL, // Certifique-se de que esta URL é válida
            });

            const embed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Green)
                .setTitle('Mensagens Apagadas')
                .addFields(
                    { name: 'Executor', value: `${interaction.user.tag} (ID: ${interaction.user.id})` },
                    { name: 'Canal', value: `${targetChannel.name} (ID: ${targetChannel.id})` },
                    { name: 'Quantidade', value: `${fetchedMessages.size}` },
                )
                .setTimestamp();

            await webhookClient.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.editReply({
                content: '❌ Ocorreu um erro ao tentar apagar as mensagens. Certifique-se de que as mensagens têm menos de 14 dias de idade.',
            });
        }
    },
};
