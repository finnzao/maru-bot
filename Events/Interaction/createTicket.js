const Discord = require('../../Utils/discordClient');
const { roles } = require('../../config');

module.exports = {
    name: 'interactionCreate',
    execute: async (client, interaction) => {
        if (!interaction.isButton()) return;

        // Verificar se o botão clicado é o de criar ticket
        if (interaction.customId === 'create_ticket') {
            await interaction.deferReply({ ephemeral: true });

            const user = interaction.user;
            const guild = interaction.guild;

            try {
                // Verificar se o usuário já tem um ticket aberto
                const existingTicket = guild.channels.cache.find(channel => channel.topic === `Ticket de ${user.tag}`);
                if (existingTicket) {
                    return interaction.editReply({ content: '❌ Você já tem um ticket aberto!' });
                }

                // Obter a categoria "TRIBUNAL"
                const tribunalCategory = guild.channels.cache.find(category => category.name === 'TRIBUNAL' && category.type === Discord.ChannelType.GuildCategory);
                if (!tribunalCategory) {
                    return interaction.editReply({ content: '❌ Não foi possível encontrar a categoria "TRIBUNAL".' });
                }

                // Criar um canal de ticket como subcanal da categoria "TRIBUNAL"
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${user.username}`,
                    type: Discord.ChannelType.GuildText,
                    topic: `Ticket de ${user.tag}`,
                    parent: tribunalCategory.id, // Definindo como subcanal da categoria "TRIBUNAL"
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
                console.error('Erro ao criar o ticket:', error);
                interaction.editReply({ content: '❌ Ocorreu um erro ao tentar criar o ticket.' });
            }
        }
    },
};
