// Events/Online/activityTracker.js
module.exports = {
    name: 'activityTracker',
    execute: (client) => {
        // Certifique-se de que o client está sendo passado e está definido
        if (!client) {
            console.error('Client não foi definido corretamente para activityTracker.');
            return;
        }

        const userActivities = new Map(); // Armazena dados de mensagens e horas em chamadas

        // Evento para rastrear mensagens no chat
        client.on('messageCreate', (message) => {
            if (message.author.bot) return;

            // Incrementar contador de mensagens do usuário
            const userId = message.author.id;

            if (!userActivities.has(userId)) {
                userActivities.set(userId, { messages: 0, voiceHours: 0 });
            }

            userActivities.get(userId).messages += 1;

            // Verificar e atribuir tags de mensagens
            const userData = userActivities.get(userId);
            const member = message.guild.members.cache.get(userId);

            if (userData.messages >= 12000 && !member.roles.cache.has('ROLE_ID_GARNET')) {
                member.roles.add('ROLE_ID_GARNET'); // Adiciona a tag @Garnet
            } else if (userData.messages >= 8000 && !member.roles.cache.has('ROLE_ID_BRUISER')) {
                member.roles.add('ROLE_ID_BRUISER'); // Adiciona a tag @Bruiser
            } else if (userData.messages >= 4000 && !member.roles.cache.has('ROLE_ID_ACTIVE')) {
                member.roles.add('ROLE_ID_ACTIVE'); // Adiciona a tag @Active
            }
        });

        // Evento para rastrear entrada e saída de chamadas de voz
        client.on('voiceStateUpdate', (oldState, newState) => {
            if (newState.member.user.bot) return;

            const userId = newState.member.id;

            if (!userActivities.has(userId)) {
                userActivities.set(userId, { messages: 0, voiceHours: 0 });
            }

            // Rastrear início de chamada
            if (!oldState.channelId && newState.channelId) {
                userActivities.get(userId).joinTime = Date.now();
            }
            // Rastrear término de chamada
            else if (oldState.channelId && !newState.channelId) {
                const joinTime = userActivities.get(userId).joinTime;
                if (joinTime) {
                    const timeSpent = (Date.now() - joinTime) / 3600000; // Converter ms para horas
                    userActivities.get(userId).voiceHours += timeSpent;

                    // Verificar e atribuir tags de horas de voz
                    const userData = userActivities.get(userId);
                    const member = newState.member;

                    if (userData.voiceHours >= 1000 && !member.roles.cache.has('ROLE_ID_HASHIRA')) {
                        member.roles.add('ROLE_ID_HASHIRA'); // Adiciona a tag @Hashira
                    } else if (userData.voiceHours >= 800 && !member.roles.cache.has('ROLE_ID_HINOTO')) {
                        member.roles.add('ROLE_ID_HINOTO'); // Adiciona a tag @Hinoto
                    } else if (userData.voiceHours >= 600 && !member.roles.cache.has('ROLE_ID_TSUCHINOE')) {
                        member.roles.add('ROLE_ID_TSUCHINOE'); // Adiciona a tag @Tsuchinoe
                    } else if (userData.voiceHours >= 300 && !member.roles.cache.has('ROLE_ID_KANOTO')) {
                        member.roles.add('ROLE_ID_KANOTO'); // Adiciona a tag @Kanoto
                    }
                }
            }
        });

        // Exportar as atividades do usuário para uso externo (ex.: em comandos)
        module.exports.userActivities = userActivities;
    },
};
