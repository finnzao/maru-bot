const Discord = require('../../Utils/discordClient');
const { webhooks } = require('../../config');
const { ChannelType } = require('discord.js');
const { getMemberPermissionLevel } = require('../../Utils/permissionCheck'); // Importa a função de verificação

module.exports = {
    name: 'ban',
    description: 'Banir permanentemente um usuário e apagar todas as suas mensagens.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            type: Discord.ApplicationCommandOptionType.User,
            description: 'O usuário a ser banido',
            required: true,
        },
        {
            name: 'motivo',
            type: Discord.ApplicationCommandOptionType.String,
            description: 'Motivo do banimento',
            required: true,
        },
    ],
    run: async (client, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: true });

            const targetUser = interaction.options.getUser('usuário');
            const reason = interaction.options.getString('motivo');
            const member = interaction.guild.members.cache.get(targetUser.id);

            // Verifica o nível de permissão do executor
            const permissionLevel = getMemberPermissionLevel(interaction.member);

            if (permissionLevel !== 'Maxima') {
                return interaction.editReply({
                    content: '❌ Apenas usuários com o nível de permissão "Maxima" podem usar este comando.',
                });
            }

            // Verifica se o executor tem a permissão nativa de BanMembers (opcional)
            if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.BanMembers)) {
                return interaction.editReply({
                    content: '❌ Você não tem permissão para banir membros.',
                });
            }

            if (!interaction.guild.members.me.permissions.has(Discord.PermissionsBitField.Flags.BanMembers)) {
                return interaction.editReply({
                    content: '❌ Eu não tenho permissão para banir membros.',
                });
            }

            if (!member) {
                return interaction.editReply({
                    content: '❌ Não consegui encontrar o usuário especificado no servidor.',
                });
            }

            if (!member.bannable) {
                return interaction.editReply({
                    content: '❌ Não consigo banir este usuário. Certifique-se de que meu cargo esteja acima do cargo do usuário e que eu tenha as permissões necessárias.',
                });
            }

            // 🔥 Apagar mensagens do usuário em todos os canais de texto
            const channels = interaction.guild.channels.cache.filter(
                channel => channel.type === ChannelType.GuildText
            );

            for (const channel of channels.values()) {
                try {
                    const fetchedMessages = await channel.messages.fetch({ limit: 100 });
                    const userMessages = fetchedMessages.filter(message => message.author.id === targetUser.id);
                    await channel.bulkDelete(userMessages, true);
                } catch (err) {
                    console.error(`Erro ao tentar apagar as mensagens de ${targetUser.tag} no canal ${channel.name}:`, err);
                }
            }

            await member.ban({ reason });

            interaction.editReply({
                content: `✅ **${targetUser.username}** foi banido e todas as suas mensagens foram apagadas.`,
            });

            // 🔥 Enviar log para o webhook (opcional)
            const banWebhook = webhooks.banWebhook;

            if (!banWebhook) {
                console.error("❌ Erro: Webhook URL para banimento não está definida!");
                return interaction.editReply({ content: '❌ Ocorreu um erro: Webhook não configurado corretamente.' });
            }

            const webhookClient = new Discord.WebhookClient({ url: banWebhook });

            const embed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Red)
                .setTitle('Usuário Banido')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Executor', value: `${interaction.user.tag} (ID: ${interaction.user.id})` },
                    { name: 'Usuário Banido', value: `${targetUser.tag} (ID: ${targetUser.id})` },
                    { name: 'Motivo', value: reason }
                )
                .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
                .setTimestamp();

            await webhookClient.send({ embeds: [embed] });

        } catch (error) {
            console.error('Erro no comando /ban:', error);
            interaction.editReply({
                content: '❌ Ocorreu um erro ao tentar banir o usuário e apagar suas mensagens.',
            });
        }
    },
};
