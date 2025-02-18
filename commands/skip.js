const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Salta la canción actual."),

    async execute(interaction, client) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const musicChannel = global.musicChannels ? global.musicChannels[guildId] : null;

        if (musicChannel && interaction.channel.id !== musicChannel) {
            return interaction.editReply({ content: `❌ Usa los comandos de música en <#${musicChannel}>.`, ephemeral: true });
        }

        const player = client.lavalink.manager.players.get(guildId);
        if (!player || !player.queue.current) {
            return interaction.editReply({ content: "❌ No hay ninguna canción para saltar.", ephemeral: true });
        }

        const { title } = player.queue.current;
        player.stop(); // Salta la canción actual

        if (player.queue.size === 0) {
            await interaction.editReply(`⏭️ **${title}** saltada. No hay más canciones en la cola.`);
            player.destroy(); // Desconectar si no hay más canciones
        } else {
            await interaction.editReply(`⏭️ **${title}** saltada. Reproduciendo la siguiente canción...`);
        }
    }
};
