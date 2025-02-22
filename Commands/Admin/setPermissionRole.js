const { ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const { loadPermissions, savePermissions } = require('../../Utils/permissionCheck');
const { checkPermission } = require('../../Utils/commandMiddleware');

module.exports = {
    name: 'setperm',
    description: 'Define um nível de permissão para um cargo.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'nivel',
            description: 'Escolha o nível de permissão para este cargo',
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
            description: 'Selecione o cargo que deseja configurar',
            type: ApplicationCommandOptionType.Role,
            required: true
        }
    ],
    
    run: async (client, interaction) => {
        await checkPermission({ requiredPermissions: ['Administrator'] })(client, interaction, async () => {
            const nivel = interaction.options.getString('nivel');
            const cargo = interaction.options.getRole('cargo');

            const permissions = loadPermissions();

            // Evitar duplicatas
            if (permissions[nivel].includes(cargo.id)) {
                return interaction.reply({
                    content: `⚠️ O cargo <@&${cargo.id}> já está no nível **${nivel}**.`,
                    ephemeral: true
                });
            }

            // Adiciona o ID do cargo ao nível selecionado
            permissions[nivel].push(cargo.id);
            savePermissions(permissions);

            return interaction.reply({
                content: `✅ O cargo <@&${cargo.id}> foi adicionado ao nível **${nivel}**.`,
                ephemeral: false
            });
        });
    }
};
