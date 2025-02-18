const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Reproduce música en el canal de voz")
        .addStringOption(option =>
            option.setName("query")
                .setDescription("El nombre o enlace de la canción")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        const query = interaction.options.getString("query");
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: "❌ Debes estar en un canal de voz.", ephemeral: true });
        }

        // Obtener el reproductor de Erela.js
        let player = client.lavalink.manager.players.get(interaction.guild.id);
        if (!player) {
            player = client.lavalink.manager.create({
                guild: interaction.guild.id,
                voiceChannel: voiceChannel.id,
                textChannel: interaction.channel.id,
                selfDeafen: true
            });
        }

        if (player.state !== "CONNECTED") await player.connect();

        await interaction.reply(`🔍 Buscando: **${query}**`);

        const searchResult = await client.lavalink.manager.search(query, interaction.user);

        if (!searchResult.tracks.length) {
            return interaction.followUp({ content: "❌ No se encontraron resultados.", ephemeral: true });
        }

        const track = searchResult.tracks[0];
        player.queue.add(track);

        if (!player.playing && !player.paused) {
            player.play();
            interaction.followUp(`🎶 Reproduciendo ahora: **${track.title}**`);
        } else {
            interaction.followUp(`🎵 Añadido a la cola: **${track.title}**`);
        }
    }
};
