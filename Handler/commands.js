const fs = require('fs').promises;
const path = require('path');
const Discord = require('discord.js');
const { checkPermission } = require('../Utils/commandMiddleware');

async function commandsHandler(client) {
  client.slashCommands = new Discord.Collection();
  
  try {
    const folders = await fs.readdir('./Commands');

    for (const folder of folders) {
      const files = await fs.readdir(`./Commands/${folder}/`);

      for (const file of files) {
        if (!file.endsWith('.js')) continue;

        const command = require(`../Commands/${folder}/${file}`);

        if (!command.name) continue;

        // Aplica middleware automaticamente em comandos de moderação e admin
        if (['Moderation', 'Admin'].includes(folder)) {
          const originalRun = command.run;
          command.run = async (client, interaction) => {
            await checkPermission(['Media', 'Maxima'])(client, interaction, async () => {
              await originalRun(client, interaction);
            });
          };
        }

        client.slashCommands.set(command.name, command);
      }
    }

    client.on('ready', () => {
      client.guilds.cache.forEach(guild => guild.commands.set([...client.slashCommands.values()]));
      console.log(`📘 Comandos carregados!`);
    });

  } catch (error) {
    console.log('Erro ao carregar comandos: ', error);
  }
}

module.exports = commandsHandler;
