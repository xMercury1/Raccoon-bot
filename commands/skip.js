const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("⏭️ Salta la canción actual."),

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

        if (!player || !player.queue.current) {
            return interaction.editReply({
                content: "❌ No hay ninguna canción reproduciéndose en este momento.",
                ephemeral: true
            });
        }

        const skippedTrack = player.queue.current;
        const title = skippedTrack.title;

        try {
            player.stop(); // Saltar canción actual

            if (player.queue.size === 0) {
                player.destroy(); // Si no quedan canciones, cerrar sesión
            }

            const embed = new EmbedBuilder()
                .setColor("Yellow")
                .setTitle("⏭️ Canción Saltada")
                .setDescription(`Se ha saltado **${title}**.\n${player.queue.size === 0 ? "No hay más canciones en la cola." : "Reproduciendo la siguiente canción..."}`)
                .setFooter({ text: `Comando ejecutado por ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {
            console.error("❌ Error al intentar saltar canción:", err);
            return interaction.editReply({
                content: "❌ Hubo un error al intentar saltar la canción. Por favor, intenta de nuevo o contacta a un admin.",
                ephemeral: true
            });
        }
    }
};
