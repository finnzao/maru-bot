// Commands/Utilidade/tags.js
const Discord = require('../../Utils/discordClient');
const userActivities = require('../../Events/Online/activityTracker').userActivities;
const { roles } = require('../../config');

module.exports = {
    name: 'tags',
    description: 'Permite que o usuário solicite suas tags baseadas nas atividades.',
    type: Discord.ApplicationCommandType.ChatInput,
    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const member = interaction.guild.members.cache.get(userId);

        if (!userActivities.has(userId)) {
            return interaction.editReply({ content: `❌ Você ainda não possui registros de atividades.` });
        }

        const userData = userActivities.get(userId);
        const rolesToAdd = [];

        // Verificar tags de mensagens
        if (userData.messages >= 12000 && !member.roles.cache.has(roles.garnet)) {
            rolesToAdd.push(roles.garnet); // Adiciona a tag @Garnet
        } else if (userData.messages >= 8000 && !member.roles.cache.has(roles.bruiser)) {
            rolesToAdd.push(roles.bruiser); // Adiciona a tag @Bruiser
        } else if (userData.messages >= 4000 && !member.roles.cache.has(roles.active)) {
            rolesToAdd.push(roles.active); // Adiciona a tag @Active
        }

        // Verificar tags de horas em call
        if (userData.voiceHours >= 1000 && !member.roles.cache.has(roles.hashira)) {
            rolesToAdd.push(roles.hashira); // Adiciona a tag @Hashira
        } else if (userData.voiceHours >= 800 && !member.roles.cache.has(roles.hinoto)) {
            rolesToAdd.push(roles.hinoto); // Adiciona a tag @Hinoto
        } else if (userData.voiceHours >= 600 && !member.roles.cache.has(roles.tsuchinoe)) {
            rolesToAdd.push(roles.tsuchinoe); // Adiciona a tag @Tsuchinoe
        } else if (userData.voiceHours >= 300 && !member.roles.cache.has(roles.kanoto)) {
            rolesToAdd.push(roles.kanoto); // Adiciona a tag @Kanoto
        }

        if (rolesToAdd.length === 0) {
            return interaction.editReply({ content: `❌ Você ainda não possui conquistas suficientes para receber uma nova tag.` });
        }

        try {
            await member.roles.add(rolesToAdd);
            interaction.editReply({ content: `✅ As seguintes tags foram atribuídas a você: ${rolesToAdd.map(roleId => `<@&${roleId}>`).join(', ')}` });
        } catch (error) {
            console.error(error);
            interaction.editReply({ content: `❌ Ocorreu um erro ao tentar adicionar as tags a você.` });
        }
    },
};
