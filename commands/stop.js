const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Detiene la música y desconecta el bot."),

    async execute(interaction, client) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const musicChannel = global.musicChannels ? global.musicChannels[guildId] : null;

        if (musicChannel && interaction.channel.id !== musicChannel) {
            return interaction.editReply({ content: `❌ Usa los comandos de música en <#${musicChannel}>.`, ephemeral: true });
        }

        const player = client.lavalink.manager.players.get(guildId);
        if (!player) {
            return interaction.editReply({ content: "❌ No hay música reproduciéndose.", ephemeral: true });
        }

        player.destroy(); // Detiene la música y desconecta
        interaction.editReply("🛑 Música detenida y bot desconectado.");
    }
};
