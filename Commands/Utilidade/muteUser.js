const Discord = require('../../Utils/discordClient');
const ms = require('ms');
const { checkPermissions } = require('../../Utils/permissionUtils');

module.exports = {
    name: 'mute',
    description: 'Mute temporário de um usuário.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'usuário',
            type: Discord.ApplicationCommandOptionType.User,
            description: 'O usuário a ser mutado',
            required: true,
        },
        {
            name: 'tempo',
            type: Discord.ApplicationCommandOptionType.String,
            description: 'Duração do mute (exemplo: 10s, 5m, 1h)',
            required: true,
        },
        {
            name: 'motivo',
            type: Discord.ApplicationCommandOptionType.String,
            description: 'Motivo do mute',
            required: false,
        },
    ],
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true }); // Deferindo para ganhar mais tempo

        const targetUser = interaction.options.getUser('usuário');
        const muteDuration = interaction.options.getString('tempo');
        const reason = interaction.options.getString('motivo') || 'Nenhum motivo fornecido';
        const member = interaction.guild.members.cache.get(targetUser.id);

        const requiredPermissions = Discord.PermissionsBitField.Flags.MuteMembers;
        const permissionError = checkPermissions(interaction, requiredPermissions);
        if (permissionError) {
            return interaction.editReply({
                content: permissionError,
            });
        }

        // Verificar se a duração inclui uma unidade de tempo válida
        if (!/[smhdw]$/.test(muteDuration)) {
            return interaction.editReply({
                content: '❌ Por favor, forneça uma duração válida com a unidade de tempo (ex.: 10s, 5m, 1h).',
            });
        }

        // Converter a duração do mute
        const durationMs = ms(muteDuration);
        if (!durationMs || durationMs <= 0) {
            return interaction.editReply({
                content: '❌ Por favor, forneça uma duração válida para o mute.',
            });
        }

        // Verificar se o usuário já está mutado em canais de voz
        if (member.voice.serverMute) {
            return interaction.editReply({
                content: '❌ Este usuário já está mutado em canais de voz.',
            });
        }

        try {
            // Aplicar o server mute no usuário
            if (member.voice.channel) {
                await member.voice.setMute(true, reason);
            } else {
                return interaction.editReply({
                    content: '❌ O usuário não está em um canal de voz atualmente.',
                });
            }

            interaction.editReply({
                content: `✅ **${targetUser.username}** foi mutado em canais de voz por ${muteDuration}.`,
            });

            // Log para o webhook
            const webhookClient = new Discord.WebhookClient({
                url: process.env.MUTE_WEBHOOK_URL, // Certifique-se de que esta URL é válida
            });

            const embed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Red)
                .setTitle('Usuário Mutado em Canal de Voz')
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true })) // Adiciona a miniatura com o avatar do usuário mutado
                .addFields(
                    { name: 'Executor', value: `${interaction.user.tag} (ID: ${interaction.user.id})` },
                    { name: 'Usuário Mutado', value: `${targetUser.tag} (ID: ${targetUser.id})` },
                    { name: 'Motivo', value: reason },
                    { name: 'Duração', value: muteDuration }
                )
                .setImage(targetUser.displayAvatarURL({ dynamic: true, size: 512 })) // Mostra a imagem do avatar do usuário mutado em maior tamanho
                .setTimestamp();

            await webhookClient.send({ embeds: [embed] });

            // Remover o mute do canal de voz após o tempo definido
            setTimeout(async () => {
                if (member.voice.channel && member.voice.serverMute) {
                    await member.voice.setMute(false, 'Tempo de mute expirado');
                    // Notificar o usuário sobre o término do mute
                    member.send(`Seu tempo de mute no canal de voz do servidor **${interaction.guild.name}** expirou. Você agora pode falar novamente.`);
                }
            }, durationMs);
        } catch (error) {
            console.error(error);
            interaction.editReply({
                content: '❌ Ocorreu um erro ao tentar mutar o usuário.',
            });
        }
    },
};
