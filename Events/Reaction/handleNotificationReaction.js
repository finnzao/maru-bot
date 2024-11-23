const { roles } = require('../../config');

module.exports = {
    name: 'handleNotificationReaction',
    execute: (client) => {
        client.on('messageReactionAdd', async (reaction, user) => {
            // Ignorar reações do bot
            if (user.bot) return;

            // Certificar que a reação está carregada
            if (reaction.partial) {
                try {
                    await reaction.fetch();
                } catch (error) {
                    console.error('Erro ao buscar a reação:', error);
                    return;
                }
            }

            // Verificar se a reação foi ao emoji correto
            if (reaction.emoji.name === '🔔') {
                const guild = reaction.message.guild;
                const member = guild.members.cache.get(user.id);

                // Verificar se o membro já tem o cargo
                if (!member.roles.cache.has(roles.notification)) {
                    try {
                        await member.roles.add(roles.notification);
                        console.log(`✅ Cargo de notificação atribuído a ${user.tag}.`);
                    } catch (error) {
                        console.error(`Erro ao atribuir o cargo de notificação para ${user.tag}:`, error);
                    }
                }
            }
        });

        client.on('messageReactionRemove', async (reaction, user) => {
            // Ignorar reações do bot
            if (user.bot) return;

            // Certificar que a reação está carregada
            if (reaction.partial) {
                try {
                    await reaction.fetch();
                } catch (error) {
                    console.error('Erro ao buscar a reação:', error);
                    return;
                }
            }

            // Verificar se a reação foi ao emoji correto
            if (reaction.emoji.name === '🔔') {
                const guild = reaction.message.guild;
                const member = guild.members.cache.get(user.id);

                // Verificar se o membro tem o cargo
                if (member.roles.cache.has(roles.notification)) {
                    try {
                        await member.roles.remove(roles.notification);
                        console.log(`✅ Cargo de notificação removido de ${user.tag}.`);
                    } catch (error) {
                        console.error(`Erro ao remover o cargo de notificação de ${user.tag}:`, error);
                    }
                }
            }
        });
    }
};
