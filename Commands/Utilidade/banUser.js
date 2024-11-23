const Discord = require('../../Utils/discordClient');

module.exports = {
    name: 'ban',
    description: 'Banir permanentemente um usuário.',
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
        await interaction.deferReply({ ephemeral: true }); // Deferindo para ganhar mais tempo

        const targetUser = interaction.options.getUser('usuário');
        const reason = interaction.options.getString('motivo');
        const member = interaction.guild.members.cache.get(targetUser.id);

        // Verificar se o executor tem permissão para banir membros
        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.BanMembers)) {
            return interaction.editReply({
                content: '❌ Você não tem permissão para banir membros.',
            });
        }

        // Verificar se o bot tem permissão para banir membros
        if (!interaction.guild.members.me.permissions.has(Discord.PermissionsBitField.Flags.BanMembers)) {
            return interaction.editReply({
                content: '❌ Eu não tenho permissão para banir membros.',
            });
        }

        // Verificar se o membro a ser banido existe no servidor
        if (!member) {
            return interaction.editReply({
                content: '❌ Não consegui encontrar o usuário especificado no servidor.',
            });
        }

        // Verificar se o usuário é banível (ex: o cargo do bot é maior que o do usuário)
        if (!member.bannable) {
            return interaction.editReply({
                content: '❌ Não consigo banir este usuário. Certifique-se de que meu cargo esteja acima do cargo do usuário e que eu tenha as permissões necessárias.',
            });
        }

        try {
            // Banir o usuário
            await member.ban({ reason });

            interaction.editReply({
                content: `✅ **${targetUser.username}** foi banido por "${reason}".`,
            });

            // Log para o webhook
            const webhookClient = new Discord.WebhookClient({
                url: process.env.BAN_WEBHOOK_URL, // Certifique-se de que esta URL é válida
            });

            const embed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Red)
                .setTitle('Usuário Banido')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true })) // Adiciona a miniatura com o avatar do usuário banido
                .addFields(
                    { name: 'Executor', value: `${interaction.user.tag} (ID: ${interaction.user.id})` },
                    { name: 'Usuário Banido', value: `${targetUser.tag} (ID: ${targetUser.id})` },
                    { name: 'Motivo', value: reason }
                )
                .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 512 })) // Mostra a imagem do avatar do usuário banido em maior tamanho
                .setTimestamp();

            await webhookClient.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.editReply({
                content: '❌ Ocorreu um erro ao tentar banir o usuário.',
            });
        }
    },
};
