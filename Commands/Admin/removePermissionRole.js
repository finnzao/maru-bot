const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { loadPermissions, savePermissions } = require('../../Utils/permissionCheck');
const { checkPermission } = require('../../Utils/commandMiddleware');

module.exports = {
    name: 'removeperm',
    description: 'Remove um cargo de um nível de permissão.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'nivel',
            description: 'Escolha o nível de permissão que deseja remover',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: 'Maxima', value: 'Maxima' },
                { name: 'Media', value: 'Media' },
                { name: 'Baixa', value: 'Baixa' }
            ]
        },
        {
            name: 'cargo',
            description: 'Selecione o cargo que deseja remover',
            type: ApplicationCommandOptionType.Role,
            required: true
        }
    ],

    run: async (client, interaction) => {
        await checkPermission({ requiredPermissions: ['Administrator'] })(client, interaction, async () => {
            const nivel = interaction.options.getString('nivel');
            const cargo = interaction.options.getRole('cargo');

            const permissions = loadPermissions();

            // Verifica se o cargo realmente está no nível indicado
            if (!permissions[nivel].includes(cargo.id)) {
                return interaction.reply({
                    content: `⚠️ O cargo <@&${cargo.id}> não está configurado no nível **${nivel}**.`,
                    ephemeral: true
                });
            }

            // Remove o ID do cargo do nível correspondente
            permissions[nivel] = permissions[nivel].filter(roleId => roleId !== cargo.id);
            savePermissions(permissions);

            return interaction.reply({
                content: `✅ O cargo <@&${cargo.id}> foi removido do nível **${nivel}**.`,
                ephemeral: false
            });
        });
    }
};
