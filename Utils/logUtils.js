import { WebhookClient, EmbedBuilder, Colors } from './discordClient';

async function sendLogToWebhook(url, embedOptions) {
    const webhookClient = new WebhookClient({ url });

    const embed = new EmbedBuilder()
        .setColor(embedOptions.color || Colors.Blue)
        .setTitle(embedOptions.title)
        .setThumbnail(embedOptions.thumbnail)
        .addFields(embedOptions.fields)
        .setImage(embedOptions.image)
        .setTimestamp();

    try {
        await webhookClient.send({ embeds: [embed] });
    } catch (error) {
        console.error('Erro ao enviar log para o webhook:', error);
    }
}

export default { sendLogToWebhook };
