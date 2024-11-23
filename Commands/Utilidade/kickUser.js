const Discord = require('../../Utils/discordClient');
const { checkPermissions } = require('../../Utils/permissionUtils');

module.exports = {
    name: 'kick',
    description: 'Expulsar um usuário do servidor.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            type: Discord.ApplicationCommandOptionType.User,
            description: 'O usuário a ser expulso',
            required: true,
        },
        {
            name: 'motivo',
            type: Discord.ApplicationCommandOptionType.String,
            description: 'Motivo para expulsar o usuário',
            required: true,
        },
    ],
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true }); // Deferindo para ganhar mais tempo

        const targetUser = interaction.options.getUser('usuário');
        const reason = interaction.options.getString('motivo');
        const member = interaction.guild.members.cache.get(targetUser.id);

        const requiredPermissions = Discord.PermissionsBitField.Flags.KickMembers;
        const permissionError = checkPermissions(interaction, requiredPermissions);
        if (permissionError) {
            return interaction.editReply({
                content: permissionError,
            });
        }

        // Verificar se o membro a ser expulso existe no servidor
        if (!member) {
            return interaction.editReply({
                content: '❌ Não consegui encontrar o usuário especificado no servidor.',
            });
        }

        // Verificar se o usuário é expulsável (ex: o cargo do bot é maior que o do usuário)
        if (!member.kickable) {
            return interaction.editReply({
                content: '❌ Não consigo expulsar este usuário. Certifique-se de que meu cargo esteja acima do cargo do usuário e que eu tenha as permissões necessárias.',
            });
        }

        try {
            // Expulsar o usuário
            await member.kick(reason);

            interaction.editReply({
                content: `✅ **${targetUser.username}** foi expulso por "${reason}".`,
            });

            // Log para o webhook
            const webhookClient = new Discord.WebhookClient({
                url: 'https://discord.com/api/webhooks/1307139297857765467/K43v5M7KsIFSYh1ku27vBQmIBd704XzWQijPN_gZ7u4gIGgQC0Zm1T4UngKPZI-SlWhD', // Certifique-se de que esta URL é válida
            });

            const embed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Red)
                .setTitle('Usuário Expulso')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true })) // Adiciona a miniatura com o avatar do usuário expulso
                .addFields(
                    { name: 'Executor', value: `${interaction.user.tag} (ID: ${interaction.user.id})` },
                    { name: 'Usuário Expulso', value: `${targetUser.tag} (ID: ${targetUser.id})` },
                    { name: 'Motivo', value: reason }
                )
                .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 512 })) // Mostra a imagem do avatar do usuário expulso em maior tamanho
                .setTimestamp();

            await webhookClient.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            interaction.editReply({
                content: '❌ Ocorreu um erro ao tentar expulsar o usuário.',
            });
        }
    },
};
