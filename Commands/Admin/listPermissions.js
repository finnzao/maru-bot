const { ApplicationCommandType, EmbedBuilder, Colors, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType } = require('discord.js');
const { loadPermissions, savePermissions } = require('../../Utils/permissionCheck');
const { checkPermission } = require('../../Utils/commandMiddleware');

module.exports = {
    name: 'listperm',
    description: 'Lista os cargos configurados em cada nível de permissão e permite removê-los com um menu suspenso.',
    type: ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {
        await checkPermission({ requiredPermissions: ['Administrator'] })(client, interaction, async () => {
            let permissions = loadPermissions();
            const levels = ['Maxima', 'Media', 'Baixa'];
            const levelNames = {
                Maxima: '🔴 Nível Máximo',
                Media: '🟠 Nível Médio',
                Baixa: '🟢 Nível Baixo'
            };

            // Criar embed inicial
            const embed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle('📜 Permissões de Cargos')
                .setTimestamp();

            // Criar lista de opções para o menu suspenso
            let selectMenuOptions = [];

            levels.forEach(level => {
                const roleIds = permissions[level];
                if (roleIds.length === 0) {
                    embed.addFields({ name: levelNames[level], value: 'Nenhum cargo definido', inline: false });
                } else {
                    embed.addFields({
                        name: levelNames[level],
                        value: roleIds.map(roleId => `<@&${roleId}>`).join('\n'),
                        inline: false
                    });

                    roleIds.forEach(roleId => {
                        const role = interaction.guild.roles.cache.get(roleId);
                        const roleName = role ? role.name : `ID:${roleId}`;

                        selectMenuOptions.push(
                            new StringSelectMenuOptionBuilder()
                                .setLabel(`${roleName} (${level})`)
                                .setValue(`remove_${level}_${roleId}`)
                        );
                    });
                }
            });

            // Se não houver cargos, enviar uma mensagem padrão
            if (selectMenuOptions.length === 0) {
                return interaction.reply({
                    embeds: [embed.setDescription('Nenhum cargo foi configurado para permissões.')],
                    ephemeral: false
                });
            }

            // Criar menu suspenso
            const selectMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('remove_permission')
                    .setPlaceholder('Selecione um cargo para remover...')
                    .addOptions(selectMenuOptions)
            );

            // Enviar a mensagem com o embed e o menu suspenso
            const message = await interaction.reply({ 
                embeds: [embed], 
                components: [selectMenu], 
                ephemeral: false 
            });

            // Criar um coletor de interações para o menu suspenso
            const collector = message.createMessageComponentCollector({ 
                componentType: ComponentType.StringSelect, 
                time: 60000 // 1 minuto de validade
            });

            collector.on('collect', async menuInteraction => {
                // Verifica se o usuário tem permissão de Administrador
                if (!menuInteraction.member.permissions.has('Administrator')) {
                    return menuInteraction.reply({
                        content: '❌ Você não tem permissão para remover cargos!',
                        ephemeral: true
                    });
                }

                const [_, level, roleId] = menuInteraction.values[0].split('_');

                // Remover o cargo do nível correspondente
                permissions[level] = permissions[level].filter(id => id !== roleId);
                savePermissions(permissions);

                // Atualizar o embed
                const updatedEmbed = new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle('📜 Permissões de Cargos (Atualizado)')
                    .setTimestamp();

                let updatedOptions = [];

                levels.forEach(level => {
                    const roleIds = permissions[level];
                    if (roleIds.length === 0) {
                        updatedEmbed.addFields({ name: levelNames[level], value: 'Nenhum cargo definido', inline: false });
                    } else {
                        updatedEmbed.addFields({
                            name: levelNames[level],
                            value: roleIds.map(roleId => `<@&${roleId}>`).join('\n'),
                            inline: false
                        });

                        roleIds.forEach(roleId => {
                            const role = interaction.guild.roles.cache.get(roleId);
                            const roleName = role ? role.name : `ID:${roleId}`;

                            updatedOptions.push(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel(`${roleName} (${level})`)
                                    .setValue(`remove_${level}_${roleId}`)
                            );
                        });
                    }
                });

                // Se não houver mais opções, remover o menu suspenso
                const updatedComponents = updatedOptions.length > 0
                    ? [new ActionRowBuilder().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('remove_permission')
                            .setPlaceholder('Selecione um cargo para remover...')
                            .addOptions(updatedOptions)
                    )]
                    : [];

                await menuInteraction.update({ 
                    embeds: [updatedEmbed], 
                    components: updatedComponents 
                });
            });

            // Remover o menu suspenso após expirar o tempo
            collector.on('end', async () => {
                await message.edit({ components: [] });
            });
        });
    }
};
