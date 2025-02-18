const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Muestra la cola de canciones."),

    async execute(interaction, client) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const musicChannel = global.musicChannels ? global.musicChannels[guildId] : null;

        if (musicChannel && interaction.channel.id !== musicChannel) {
            return interaction.editReply({ content: `❌ Usa los comandos de música en <#${musicChannel}>.`, ephemeral: true });
        }

        const player = client.lavalink.manager.players.get(guildId);
        if (!player || !player.queue.length) {
            return interaction.editReply({ content: "❌ La cola está vacía.", ephemeral: true });
        }

        const queue = player.queue.map((track, index) => `**${index + 1}.** ${track.title}`).join("\n");
        const embed = new EmbedBuilder()
            .setTitle("🎶 Cola de Reproducción")
            .setDescription(queue)
            .setColor("Blue");

        interaction.editReply({ embeds: [embed] });
    }
};
