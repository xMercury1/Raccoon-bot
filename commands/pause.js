const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pausa la canción en reproducción."),

    async execute(interaction, client) {
        const player = client.lavalink.manager.players.get(interaction.guild.id);

        if (!player) {
            return interaction.reply({ content: "❌ No hay ninguna canción reproduciéndose.", ephemeral: true });
        }

        if (player.paused) {
            return interaction.reply({ content: "⚠️ La canción ya está pausada.", ephemeral: true });
        }

        player.pause(true); // 🔹 Pausar la música
        await interaction.reply("⏸️ Canción pausada.");
    }
};
