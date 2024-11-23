const Discord = require('../../Utils/discordClient');
const { roles } = require('../../config');

module.exports = {
    name: 'sendSupportMessage',
    execute: async (client) => {
        // Enviar a mensagem de suporte apenas no canal específico "#suporte"
        const supportChannel = client.channels.cache.find(channel => channel.name === 'suporte');
        if (!supportChannel) {
            console.error('Erro: Canal #suporte não encontrado.');
            return;
        }

        // Criar embed para mensagem de suporte
        const supportEmbed = new Discord.EmbedBuilder()
            .setColor('BLUE')
            .setTitle('Suporte')
            .setDescription('Alguém no servidor está te incomodando?\nUtilize esse sistema para reportar um membro.\n\n**Como efetuar uma denúncia:**\n1️⃣ Descreva seu problema ao apertar o botão;\n2️⃣ Prossiga conversando com nossa equipe.')
            .setImage('URL_DA_IMAGEM') // Substituir pela URL da imagem desejada
            .setFooter({ text: 'Todos os direitos reservados. 2024 © CDL' });

        // Criar botão para criar ticket
        const createTicketButton = new Discord.ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Criar Ticket')
            .setStyle(Discord.ButtonStyle.Primary);

        const row = new Discord.ActionRowBuilder().addComponents(createTicketButton);

        try {
            // Enviar mensagem de suporte com o botão
            await supportChannel.send({ embeds: [supportEmbed], components: [row] });
            console.log('✅ Mensagem de suporte enviada com sucesso.');
        } catch (error) {
            console.error('Erro ao enviar a mensagem de suporte:', error);
        }
    },
};
