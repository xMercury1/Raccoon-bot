const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("resume")
        .setDescription("Reanuda la música pausada."),

    async execute(interaction, client) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const musicChannel = global.musicChannels ? global.musicChannels[guildId] : null;

        if (musicChannel && interaction.channel.id !== musicChannel) {
            return interaction.editReply({ content: `❌ Usa los comandos de música en <#${musicChannel}>.`, ephemeral: true });
        }

        const player = client.lavalink.manager.players.get(guildId);

        // 🚨 **Verificar si Lavalink está conectado**
        if (!player) {
            return interaction.editReply({ content: "❌ No hay un reproductor de música activo. Usa `/play` primero.", ephemeral: true });
        }

        if (!player.connected) {
            try {
                await player.connect();
            } catch (error) {
                console.error("❌ Error al reconectar con Lavalink:", error);
                return interaction.editReply({ content: "❌ No se pudo conectar con el servidor de música.", ephemeral: true });
            }
        }

        if (!player.paused) {
            return interaction.editReply({ content: "❌ No hay música pausada para reanudar.", ephemeral: true });
        }

        player.pause(false);
        interaction.editReply("▶️ Música reanudada.");
    }
};
