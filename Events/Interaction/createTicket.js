const Discord = require('../../Utils/discordClient');
const { roles } = require('../../config');

module.exports = {
    name: 'createTicket',
    execute: async (client, interaction) => {
        // Verificar se a interação é um botão e se o ID do botão corresponde ao botão do ticket
        if (!interaction || !interaction.isButton() || interaction.customId !== 'create_ticket') {
            return; // Não é a interação que esperamos, então saímos da função
        }

        const guild = interaction.guild;
        const user = interaction.user;

        // Verificar se o usuário já tem um ticket aberto
        const existingTicket = guild.channels.cache.find(channel => channel.topic === `Ticket de ${user.tag}`);
        if (existingTicket) {
            return interaction.reply({ content: '❌ Você já tem um ticket aberto!', ephemeral: true });
        }

        try {
            // Criar um canal de ticket
            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.username}`,
                type: Discord.ChannelType.GuildText,
                topic: `Ticket de ${user.tag}`,
                parent: 'ID_DA_CATEGORIA_TRIBUNAL', // Substitua pelo ID da categoria desejada
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

            interaction.reply({ content: `✅ Ticket criado com sucesso! Acesse o canal ${ticketChannel}`, ephemeral: true });
        } catch (error) {
            console.error('Erro ao criar o ticket:', error);
            interaction.reply({ content: '❌ Ocorreu um erro ao tentar criar o ticket.', ephemeral: true });
        }
    },
};
