module.exports = {
    name: 'watchSpam',
    execute: (client) => {
        const ms = require('ms');
        const userMessages = new Map(); // Armazena o histórico de mensagens dos usuários
        const warnedUsers = new Set(); // Armazena os IDs dos usuários que já foram notificados

        client.on('messageCreate', async (message) => {
            // Ignorar mensagens de bots
            if (message.author.bot) return;

            // Definir o intervalo de tempo e o limite de mensagens
            const SPAM_LIMIT = 10;
            const TIME_WINDOW = 7000; // 7 segundos em milissegundos

            // Verificar se o usuário já está no mapa
            if (!userMessages.has(message.author.id)) {
                userMessages.set(message.author.id, []);
            }

            // Armazenar a nova mensagem com o timestamp atual
            const timestamps = userMessages.get(message.author.id);
            const currentTime = Date.now();
            timestamps.push(currentTime);

            // Filtrar apenas as mensagens dentro do intervalo de tempo (7 segundos)
            const recentMessages = timestamps.filter(timestamp => currentTime - timestamp < TIME_WINDOW);
            userMessages.set(message.author.id, recentMessages);

            // Verificar se o número de mensagens recentes excede o limite
            if (recentMessages.length >= SPAM_LIMIT) {
                try {
                    // Verificar se o usuário já foi notificado para evitar envio duplicado
                    if (warnedUsers.has(message.author.id)) return;

                    // Aplicar timeout no usuário
                    const member = await message.guild.members.fetch(message.author.id);
                    const muteDurationMs = ms('1m'); // Timeout de 1 minuto como exemplo
                    await member.timeout(muteDurationMs, 'Spam detectado: 10 mensagens em menos de 7 segundos.');

                    // Notificar o usuário de forma privada (DM)
                    await message.author.send(`⚠️ Você foi temporariamente silenciado no servidor **${message.guild.name}** por 1 minuto devido a envio excessivo de mensagens em um curto período de tempo. Por favor, evite enviar mensagens repetitivas para não ser silenciado novamente.`);
                    
                    // Adicionar o usuário à lista de notificados
                    warnedUsers.add(message.author.id);

                    // Limpar histórico de mensagens do usuário após o timeout ser aplicado
                    userMessages.delete(message.author.id);

                    // Log para o console
                    console.log(`Timeout aplicado a ${message.author.tag} por spam.`);

                    // Remover o usuário da lista de notificados após o timeout expirar
                    setTimeout(() => {
                        warnedUsers.delete(message.author.id);
                    }, muteDurationMs);
                } catch (error) {
                    console.error(`Erro ao tentar aplicar timeout no usuário ${message.author.tag}:`, error);
                }
            }
        });
    }
};
