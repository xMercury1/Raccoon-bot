const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pausa la música actual."),

    async execute(interaction, client) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const musicChannel = global.musicChannels ? global.musicChannels[guildId] : null;

        if (musicChannel && interaction.channel.id !== musicChannel) {
            return interaction.editReply({ content: `❌ Usa los comandos de música en <#${musicChannel}>.`, ephemeral: true });
        }

        const player = client.lavalink.manager.players.get(guildId);
        if (!player || !player.playing) {
            return interaction.editReply({ content: "❌ No hay música reproduciéndose.", ephemeral: true });
        }

        player.pause(true);
        interaction.editReply("⏸️ Música pausada.");
    }
};
