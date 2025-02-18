const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Reanuda la canción pausada."),

    async execute(interaction, client) {
        const player = client.lavalink.manager.players.get(interaction.guild.id);

        if (!player) {
            return interaction.reply({ content: "❌ No hay ninguna canción reproduciéndose.", ephemeral: true });
        }

        if (!player.paused) {
            return interaction.reply({ content: "⚠️ La canción ya está en reproducción.", ephemeral: true });
        }

        player.pause(false); // 🔹 Reanuda la música
        await interaction.reply("▶️ Canción reanudada.");
    }
};
