const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("📃 Muestra la cola de canciones."),

    async execute(interaction, client) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const musicChannel = global.musicChannels ? global.musicChannels[guildId] : null;

        if (musicChannel && interaction.channel.id !== musicChannel) {
            return interaction.editReply({
                content: `❌ Usa los comandos de música en <#${musicChannel}>.`,
                ephemeral: true
            });
        }

        const player = client.lavalink.manager.players.get(guildId);

        if (!player || (!player.queue.current && player.queue.size === 0)) {
            return interaction.editReply({
                content: "❌ No hay canciones en la cola.",
                ephemeral: true
            });
        }

        const nowPlaying = player.queue.current;
        const queue = player.queue.map((track, index) => `**${index + 1}.** ${track.title}`).slice(0, 10).join("\n"); // Solo los primeros 10

        const embed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("🎶 Cola de Reproducción")
            .setDescription(`🎧 **Reproduciendo ahora:** ${nowPlaying.title}\n\n📜 **En cola:**\n${queue || "*No hay más canciones.*"}`)
            .setFooter({ text: `Solicitado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        interaction.editReply({ embeds: [embed] });
    }
};
