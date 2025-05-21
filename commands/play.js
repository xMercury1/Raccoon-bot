const ownerId = "301144625366827021";
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("🎵 Reproduce música en el canal de voz")
        .addStringOption(option =>
            option.setName("query")
                .setDescription("🎶 Nombre o enlace de la canción")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const guildName = interaction.guild.name;
        const musicChannel = global.musicChannels ? global.musicChannels[guildId] : null;

        if (musicChannel && interaction.channel.id !== musicChannel) {
            return interaction.editReply({ content: `❌ Usa los comandos de música en <#${musicChannel}>.`, ephemeral: true });
        }

        const query = interaction.options.getString("query");
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.editReply({ content: "❌ Debes estar en un canal de voz para reproducir música.", ephemeral: true });
        }

        let player = client.lavalink.manager.players.get(guildId);
        if (!player) {
            player = client.lavalink.manager.create({
                guild: guildId,
                voiceChannel: voiceChannel.id,
                textChannel: interaction.channel.id,
                selfDeafen: true
            });
            console.log(`🎧 Player creado para guild ${guildName} (${guildId}) en canal de voz ${voiceChannel.id}`);
        }

        console.log(`Estado del player antes de conectar: ${player.state}`);

        try {
            if (!["CONNECTED", "CONNECTING"].includes(player.state)) {
                await player.connect();
                console.log(`✅ Player conectado en guild ${guildName} (${guildId})`);
            }
        } catch (error) {
            console.error("❌ Error al conectar con Lavalink:", error);

            // Notificar admin
            try {
                const owner = await client.users.fetch(ownerId);
                if (owner) {
                    const errorMessage = `⚠️ **Error con Lavalink**\n📅 Fecha: <t:${Math.floor(Date.now() / 1000)}:F>\n🏠 Servidor: **${guildName}**\n🆔 ID: \`${guildId}\`\n💥 Código: \`${error.message}\``;
                    await owner.send(errorMessage);
                    console.log(`✅ Error reportado a ${owner.tag}`);
                }
            } catch (err) {
                console.error("❌ No se pudo notificar al administrador:", err);
            }

            return interaction.editReply({
                content: "⚠️ El servidor de música está temporalmente inactivo. Se notificó al administrador. Si el problema persiste, contacta a **@xMercury1**.",
                ephemeral: true
            });
        }

        const searchResult = await client.lavalink.manager.search(query, interaction.user);

        if (
            searchResult.loadType === "LOAD_FAILED" ||
            !searchResult.tracks ||
            searchResult.tracks.length === 0
        ) {
            return interaction.editReply({ content: "❌ No se encontraron resultados. Intenta con otro nombre o enlace.", ephemeral: true });
        }

        const track = searchResult.tracks[0];
        player.queue.add(track);
        console.log(`🎶 Track añadido a la cola: ${track.title}`);

        if (!player.playing && !player.paused) {
            try {
                await player.play();
                console.log(`▶️ Reproduciendo ahora: ${track.title}`);
                await interaction.editReply({ content: `🎶 Reproduciendo ahora: **${track.title}**` });
            } catch (error) {
                console.error("❌ Error al reproducir la canción:", error);
                return interaction.editReply({ content: "❌ No pude reproducir la canción, intenta más tarde.", ephemeral: true });
            }
        } else {
            await interaction.editReply({ content: `🎵 Añadido a la cola: **${track.title}**` });
        }
    }
};
