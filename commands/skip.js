const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Salta la canción actual."),

    async execute(interaction, client) {
        const player = client.lavalink.manager.players.get(interaction.guild.id);

        if (!player) {
            return interaction.reply({ content: "❌ No hay ninguna canción reproduciéndose.", ephemeral: true });
        }

        if (!player.queue.current) {
            return interaction.reply({ content: "❌ No hay ninguna canción para saltar.", ephemeral: true });
        }

        const { title } = player.queue.current;
        player.stop(); // ⏭️ Salta la canción actual

        if (player.queue.size === 0) {
            await interaction.reply(`⏭️ **${title}** saltada. No hay más canciones en la cola. Me desconecto.`);
            player.destroy(); // 🔹 Desconectar si no hay más canciones
        } else {
            await interaction.reply(`⏭️ **${title}** saltada. Reproduciendo la siguiente canción...`);
        }
    }
};
