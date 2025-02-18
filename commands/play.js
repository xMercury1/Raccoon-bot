const ownerId = "301144625366827021"; // Reemplaza con tu ID de Discord
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
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const guildName = interaction.guild.name; // Obtener el nombre del servidor
        const musicChannel = global.musicChannels ? global.musicChannels[guildId] : null;

        if (musicChannel && interaction.channel.id !== musicChannel) {
            return interaction.editReply({ content: `❌ Usa los comandos de música en <#${musicChannel}>.`, ephemeral: true });
        }

        const query = interaction.options.getString("query");
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.editReply({ content: "❌ Debes estar en un canal de voz.", ephemeral: true });
        }

        let player = client.lavalink.manager.players.get(guildId);
        if (!player) {
            player = client.lavalink.manager.create({
                guild: guildId,
                voiceChannel: voiceChannel.id,
                textChannel: interaction.channel.id,
                selfDeafen: true
            });
        }

        try {
            if (player.state !== "CONNECTED") {
                await player.connect();
            }
        } catch (error) {
            console.error("❌ Error al conectar con Lavalink:", error);

            // 📩 **Enviar mensaje al administrador**
            try {
                const owner = await client.users.fetch(ownerId);
                if (owner) {
                    const errorMessage = `⚠️ **Error con Lavalink**  \n📅 Fecha y hora: <t:${Math.floor(Date.now() / 1000)}>  \n🏠 **Servidor:** ${guildName}  \n🆔 **ID del servidor:** ${guildId}  \n💀 **Código de error:** \`${error.message}\``;

                    await owner.send(errorMessage);
                    console.log(`✅ Mensaje de error enviado a ${owner.tag}`);
                } else {
                    console.error("❌ No se encontró el usuario del administrador.");
                }
            } catch (err) {
                console.error("❌ No pude enviar mensaje al admin:", err);
            }

            return interaction.editReply({
                content: "⚠️ **El servidor de música está temporalmente inactivo.(Se esta enviando un mensaje al administrador) Si no recibes pronta respuesta **\nPor favor, contacta a **@xMercury1** o espera un momento.",
                ephemeral: true
            });
        }

        const searchResult = await client.lavalink.manager.search(query, interaction.user);
        if (!searchResult.tracks.length) {
            return interaction.editReply({ content: "❌ No se encontraron resultados.", ephemeral: true });
        }

        const track = searchResult.tracks[0];
        player.queue.add(track);

        if (!player.playing && !player.paused) {
            player.play();
            interaction.editReply(`🎶 Reproduciendo ahora: **${track.title}**`);
        } else {
            interaction.editReply(`🎵 Añadido a la cola: **${track.title}**`);
        }
    }
};
