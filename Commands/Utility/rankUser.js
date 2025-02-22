// Commands/Utilidade/rank.js
const Discord = require('../../Utils/discordClient');
const userActivities = require('../../Events/StartUp/activityTracker').userActivities;

module.exports = {
    name: 'rank',
    description: 'Mostra o total de mensagens e horas de chamada acumuladas pelo usuário.',
    type: Discord.ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;

        if (!userActivities.has(userId)) {
            return interaction.editReply({ content: `❌ Você ainda não possui registros de atividades.` });
        }

        const userData = userActivities.get(userId);

        interaction.editReply({
            content: `📊 **${interaction.user.tag}**: \nMensagens Enviadas: **${userData.messages}**\nHoras em Call: **${userData.voiceHours.toFixed(2)}** horas`,
        });
    },
};
