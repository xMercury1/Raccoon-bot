const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Muestra la cola de canciones en reproducción."),

    async execute(interaction, client) {
        const player = client.lavalink.manager.players.get(interaction.guild.id);

        if (!player || !player.queue.current) {
            return interaction.reply({ content: "❌ No hay ninguna canción en la cola.", ephemeral: true });
        }

        const queue = player.queue;
        const nowPlaying = `🎵 **Reproduciendo ahora:** ${queue.current.title}`;

        if (queue.size === 0) {
            return interaction.reply(nowPlaying);
        }

        const queueList = queue.slice(0, 10) // 🔹 Muestra hasta 10 canciones
            .map((track, index) => `\`${index + 1}.\` ${track.title}`)
            .join("\n");

        await interaction.reply(`${nowPlaying}\n\n📜 **Cola de reproducción:**\n${queueList}`);
    }
};
