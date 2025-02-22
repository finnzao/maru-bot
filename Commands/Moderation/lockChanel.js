const Discord = require('../../Utils/discordClient');

module.exports = {
    name: 'lockchannel',
    description: 'Bloqueia o envio de mensagens no canal atual.',
    type: Discord.ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.channel;

        // Verificar se o bot tem permissão para gerenciar o canal
        if (!interaction.guild.members.me.permissionsIn(channel).has(Discord.PermissionsBitField.Flags.ManageChannels)) {
            return interaction.editReply({
                content: '❌ Eu não tenho permissão para gerenciar este canal.',
            });
        }

        // Verificar se o executor tem permissão para gerenciar o canal
        if (!interaction.member.permissionsIn(channel).has(Discord.PermissionsBitField.Flags.ManageChannels)) {
            return interaction.editReply({
                content: '❌ Você não tem permissão para gerenciar este canal.',
            });
        }

        try {
            // Bloquear o envio de mensagens para o canal
            await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
                SendMessages: false,
            });

            interaction.editReply({
                content: `🔒 O canal **${channel.name}** foi bloqueado. Usuários comuns não podem mais enviar mensagens.`,
            });

            // Log para o webhook (opcional)
            const webhookClient = new Discord.WebhookClient({
                url: process.env.LOGS_WEBHOOK_URL, // Certifique-se de que esta URL é válida
            });

            const embed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Red)
                .setTitle('Canal Bloqueado')
                .addFields(
                    { name: 'Executor', value: `${interaction.user.tag} (ID: ${interaction.user.id})` },
                    { name: 'Canal', value: `#${channel.name} (ID: ${channel.id})` }
                )
                .setTimestamp();

            await webhookClient.send({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao bloquear o canal:', error);
            interaction.editReply({
                content: '❌ Ocorreu um erro ao tentar bloquear o canal.',
            });
        }
    },
};
