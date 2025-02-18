const inactivityTimeout = 60000; // 1 minuto de inactividad

async function checkInactivity(client) {
    setInterval(() => {
        client.lavalink.manager.players.forEach((player, guildId) => {
            const queueEmpty = player.queue.length === 0;
            const isPlaying = player.playing || player.paused;

            if (queueEmpty && !isPlaying) {
                console.log(`⏳ Desconectando del servidor ${guildId} por inactividad.`);
                player.destroy();
                const guild = client.guilds.cache.get(guildId);
                if (guild) {
                    const musicChannel = global.musicChannels ? global.musicChannels[guildId] : null;
                    if (musicChannel) {
                        const channel = guild.channels.cache.get(musicChannel);
                        if (channel) {
                            channel.send("⚠️ **Me desconecté por inactividad.** Usa `/play` para volver a reproducir música.");
                        }
                    }
                }
            }
        });
    }, inactivityTimeout);
}

module.exports = { checkInactivity };
