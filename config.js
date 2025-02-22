require('dotenv').config();

const config = {
    discord: {
        token: process.env.DISCORD_BOT_TOKEN,
        color: process.env.DISCORD_COLOR,
    },
    webhooks: {
        banWebhook: process.env.BAN_WEBHOOK_URL,
        kickWebhook: process.env.KICK_WEBHOOK_URL,
        muteWebhook: process.env.MUTE_WEBHOOK_URL,
    },
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
        notificationImageUrl: "https://media.discordapp.net/attachments/1307754439247134760/1308636050121424928/BANNERS_NOTIFICAR.jpg",
    }
};

module.exports = config;
