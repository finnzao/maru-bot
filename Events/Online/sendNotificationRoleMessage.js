const Discord = require('../../Utils/discordClient');
const { channels } = require('../../config');
const { roles } = require('../../config');
module.exports = {
    name: 'sendNotificationRoleMessage',
    execute: async (client) => {
        // Certificar-se de que o bot está pronto
        client.once('ready', async () => {
            console.log('Bot está pronto, verificando o canal de notificações...');

            // Buscar o canal de notificações pelo ID
            const notificationChannel = client.channels.cache.get(channels.notificationChannel);
            if (!notificationChannel) {
                console.error('Erro: Canal #notificações não encontrado.');
                return;
            }

            // Criar embed para mensagem de notificação
            const notificationEmbed = new Discord.EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🔔 FIQUE LIGADO EM NOVIDADES!')
                .setDescription(
                    `Não perca nenhuma novidade! Ative as notificações para ser o primeiro a saber sobre novidades, sorteios e eventos exclusivos que acontecem no servidor. 
                    Seja o primeiro a aproveitar as oportunidades, participar dos sorteios e estar por dentro dos eventos que movem a nossa comunidade!\n\n
                    **Clique em 🔔 e fique sempre atualizado com tudo que acontece no DTR!**`
                )
                .setImage('https://media.discordapp.net/attachments/1307754439247134760/1308636050121424928/BANNERS_NOTIFICAR.jpg?ex=67429e4b&is=67414ccb&hm=ee0a47cf8b299007bbc5979effa546a5f7e61c578e807b3ff1d7b9fdbd1b6202&=&format=webp&width=1248&height=702')
                .setFooter({ text: 'Todos os direitos reservados, DTR. ©' });

            // Criar botão para ativar/desativar notificações
            const notificationButton = new Discord.ButtonBuilder()
                .setCustomId('toggle_notification')
                .setLabel('Receber Notificação')
                .setEmoji('🔔')
                .setStyle(Discord.ButtonStyle.Primary);

            const row = new Discord.ActionRowBuilder().addComponents(notificationButton);

            try {
                // Verificar se a mensagem já foi enviada no canal
                const messages = await notificationChannel.messages.fetch({ limit: 50 });
                const existingMessage = messages.find(msg => msg.embeds.length > 0 && msg.embeds[0].title === '🔔 FIQUE LIGADO EM NOVIDADES!');

                if (existingMessage) {
                    console.log('✅ Mensagem de notificação já existente encontrada. Observando reações...');
                    // Adiciona observação de reação na mensagem já existente
                    client.on('interactionCreate', async (interaction) => {
                        if (!interaction.isButton()) return;

                        if (interaction.customId === 'toggle_notification') {
                            const member = interaction.guild.members.cache.get(interaction.user.id);
                            if (!member) return;

                            const roleId = roles.notificationRole; // Substitua pelo ID do cargo de notificação

                            if (member.roles.cache.has(roleId)) {
                                await member.roles.remove(roleId);
                                await interaction.reply({ content: '🔕 Você não receberá mais notificações.', ephemeral: true });
                            } else {
                                await member.roles.add(roleId);
                                await interaction.reply({ content: '🔔 Você receberá notificações!', ephemeral: true });
                            }
                        }
                    });
                } else {
                    // Enviar mensagem de notificação com o embed e o botão
                    const notificationMessage = await notificationChannel.send({ embeds: [notificationEmbed], components: [row] });
                    console.log('✅ Mensagem de notificação enviada com sucesso.');

                    // Adiciona observação de reação na nova mensagem
                    client.on('interactionCreate', async (interaction) => {
                        if (!interaction.isButton()) return;

                        if (interaction.customId === 'toggle_notification') {
                            const member = interaction.guild.members.cache.get(interaction.user.id);
                            if (!member) return;

                            const roleId = roles.notificationRole; // Substitua pelo ID do cargo de notificação

                            if (member.roles.cache.has(roleId)) {
                                await member.roles.remove(roleId);
                                await interaction.reply({ content: '🔕 Você não receberá mais notificações.', ephemeral: true });
                            } else {
                                await member.roles.add(roleId);
                                await interaction.reply({ content: '🔔 Você receberá notificações!', ephemeral: true });
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Erro ao enviar ou verificar a mensagem de notificação:', error);
            }
        });
    },
};
