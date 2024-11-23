const Discord = require('../../Utils/discordClient');
const { roles } = require('../../config');

module.exports = {
    name: 'createticket',
    description: 'Cria um ticket de suporte.',
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'motivo',
            type: Discord.ApplicationCommandOptionType.String,
            description: 'Motivo do ticket.',
            required: true,
        }
    ],
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const reason = interaction.options.getString('motivo');
        const guild = interaction.guild;
        const user = interaction.user;

        try {
            // Verificar se o usuário já tem um ticket aberto
            const existingTicket = guild.channels.cache.find(channel => channel.topic === `Ticket de ${user.tag}`);
            if (existingTicket) {
                return interaction.editReply({ content: '❌ Você já tem um ticket aberto!' });
            }

            // Criar um canal de ticket
            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.username}`,
                type: Discord.ChannelType.GuildText,
                topic: `Ticket de ${user.tag}`,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [Discord.PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: user.id,
                        allow: [
                            Discord.PermissionsBitField.Flags.ViewChannel,
                            Discord.PermissionsBitField.Flags.SendMessages,
                            Discord.PermissionsBitField.Flags.ReadMessageHistory,
                        ],
                    },
                    {
                        id: roles.staff, // Usando o cargo da Staff do arquivo de configuração
                        allow: [
                            Discord.PermissionsBitField.Flags.ViewChannel,
                            Discord.PermissionsBitField.Flags.SendMessages,
                            Discord.PermissionsBitField.Flags.ReadMessageHistory,
                        ],
                    },
                ],
            });

            // Mensagem de boas-vindas ao canal do ticket
            await ticketChannel.send(`🎟️ Olá, ${user}! Bem-vindo ao seu ticket de suporte. A equipe de suporte estará com você em breve. Por favor, descreva sua solicitação com detalhes.`);

            interaction.editReply({ content: `✅ Ticket criado com sucesso! Acesse o canal ${ticketChannel}` });
        } catch (error) {
            if (error.code === 50013) {
                // Código de erro 50013 indica falta de permissões
                console.error('Erro de permissão ao criar o ticket:', error);
                interaction.editReply({ content: '❌ Não consegui criar o canal do ticket devido a falta de permissões. Verifique minhas permissões no servidor.' });
            } else if (error.message.includes('Missing Permissions')) {
                console.error('Erro de permissões ao criar o ticket:', error);
                interaction.editReply({ content: '❌ Ocorreu um erro ao criar o ticket devido a falta de permissões necessárias.' });
            } else {
                // Erro genérico
                console.error('Erro ao criar o ticket:', error);
                interaction.editReply({ content: '❌ Ocorreu um erro ao tentar criar o ticket. Por favor, tente novamente mais tarde.' });
            }
        }
    },
};
