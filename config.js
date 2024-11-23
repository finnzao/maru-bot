require('dotenv').config();

const config = {
    discord: {
        token: process.env.DISCORD_BOT_TOKEN,
        color: process.env.DISCORD_COLOR,
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
        staff: process.env.ROLE_ID_STAFF,
        active: process.env.ROLE_ID_ACTIVE,
        bruiser: process.env.ROLE_ID_BRUISER,
        garnet: process.env.ROLE_ID_GARNET,
        kanoto: process.env.ROLE_ID_KANOTO,
        tsuchinoe: process.env.ROLE_ID_TSUCHINOE,
        hinoto: process.env.ROLE_ID_HINOTO,
        hashira: process.env.ROLE_ID_HASHIRA,
        muted: process.env.ROLE_ID_MUTED,
        notificationRole: process.env.ROLE_ID_NOTIFICATION,
    },
    channels: {
        notificationChannel: process.env.CHANNEL_ID_NOTIFICATION,
    },
    images: {
        notificationImageUrl: "https://media.discordapp.net/attachments/1307754439247134760/1308636050121424928/BANNERS_NOTIFICAR.jpg?ex=67429e4b&is=67414ccb&hm=ee0a47cf8b299007bbc5979effa546a5f7e61c578e807b3ff1d7b9fdbd1b6202&=&format=webp&width=1248&height=702",
    }
};

module.exports = config;
