require('dotenv').config();

const config = {
    discord: {
        token: process.env.DISCORD_BOT_TOKEN,
        color: '00FF7F',
    },
    webhooks: [
        {
            name: 'banWebhook',
            url: process.env.BAN_WEBHOOK_URL,
        },
        {
            name: 'kickWebhook',
            url: process.env.KICK_WEBHOOK_URL,
        },
        {
            name: 'muteWebhook',
            url: process.env.MUTE_WEBHOOK_URL,
        },
    ],
    roles: {
        staff: '1308857783411675266',
        active: '1308841566357426308',
        bruiser: '1308841746507235359',
        //garnet: process.env.ROLE_ID_GARNET,
        kanoto: '1308841983153934496',
        tsuchinoe: '1308842073243521055',
        hinoto: '1308842166210138192',
        hashira: '1308842227157565441',
        muted: '1307470277772312576', // Para o comando de mute
    },
};

module.exports = config;
