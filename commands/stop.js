const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Detiene la música y desconecta el bot."),

    async execute(interaction, client) {
        const player = client.lavalink.manager.players.get(interaction.guild.id);

        if (!player) {
            return interaction.reply({ content: "❌ No hay ninguna canción reproduciéndose.", ephemeral: true });
        }

        player.destroy(); // 🔹 Detiene la música y desconecta el bot
        await interaction.reply("🛑 Se ha detenido la reproducción y el bot se ha desconectado.");
    }
};
