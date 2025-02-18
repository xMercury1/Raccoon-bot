const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const LavalinkPlayer = require("./lavalink");
const { checkInactivity } = require("./inactivityHandler"); // Importamos la función de inactividad
const musicChannels = {}; // Almacena el canal de música por servidor
require("dotenv").config();
const { getMusicChannel } = require("./database");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Necesario para detectar mensajes
        GatewayIntentBits.GuildVoiceStates
    ]
});

// 🔹 Inicializar Lavalink antes de cargar comandos
client.lavalink = new LavalinkPlayer(client);
client.commands = new Collection();

// 🔹 Cargar comandos automáticamente
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (!command.data || !command.data.name) {
        console.warn(`⚠️  El comando en ${file} no tiene un nombre definido.`);
        continue;
    }
    client.commands.set(command.data.name, command);
}

// 🔹 Evento 'ready'
client.once("ready", async () => {
    console.log(`✅ Conectado como ${client.user.tag}`);
    client.lavalink.connect();

    // 🔹 Inicializar el objeto global si no está definido
    if (!global.musicChannels) {
        global.musicChannels = {};
    }

    // 🔹 Cargar los canales guardados en Railway
    client.guilds.cache.forEach(async guild => {
        const savedChannel = await getMusicChannel(guild.id);
        if (savedChannel) {
            global.musicChannels[guild.id] = savedChannel;
            console.log(`🎵 Canal de música cargado para ${guild.name}: ${savedChannel}`);
        }
    });

    // Registrar los slash commands globalmente
    const commands = client.commands.map(cmd => cmd.data.toJSON());
    await client.application.commands.set(commands);
    console.log("✅ Slash commands registrados.");


    // 🔹 Iniciar la verificación de inactividad solo después de que el bot esté listo
    checkInactivity(client);
});

// 🔹 Manejar interacciones
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "❌ Hubo un error ejecutando este comando.", flags: 64 });
    }
});

// 🔹 Manejo de la cola cuando termina la música
client.lavalink.manager.on("queueEnd", async (player) => {
    const channel = client.channels.cache.get(player.textChannel);
    if (!channel) return;

    channel.send("⏳ No hay más canciones en la cola.");

    setTimeout(() => {
        if (!player.queue.length) { // Si la cola sigue vacía
            channel.send("👋 Me desconecté por inactividad.");
            player.destroy();
        }
    }, 180000); // 3 minutos de espera
});

// 🔹 Manejar mensajes en el canal de música
client.on("messageCreate", async message => {
    if (message.author.bot) return;

    const guildId = message.guild.id;
    const musicChannel = global.musicChannels ? global.musicChannels[guildId] : null;

    if (!musicChannel) return; // Si no hay canal configurado, ignoramos

    if (message.channel.id === musicChannel) {
        // Si el mensaje NO es un comando de música, lo eliminamos
        if (!message.content.startsWith("/") || !["play", "pause", "stop", "queue", "skip"].some(cmd => message.content.includes(cmd))) {
            await message.delete().catch(console.error);
            message.channel.send(`❌ Solo comandos de música permitidos aquí, <@${message.author.id}>.`)
                .then(msg => setTimeout(() => msg.delete(), 5000));
        }
    }
});

// 🔹 Manejo de desconexión por inactividad en canales de voz
client.on("voiceStateUpdate", async (oldState, newState) => {
    const player = client.lavalink.manager.players.get(oldState.guild.id);
    if (!player) return; // No hay reproductor activo

    const voiceChannel = client.channels.cache.get(player.voiceChannel);
    if (!voiceChannel) return;

    // Si el canal está vacío
    if (voiceChannel.members.size === 1) {
        const textChannel = client.channels.cache.get(player.textChannel);
        if (textChannel) textChannel.send("🚪 Todos se fueron del canal de voz. Me desconecto en 1 minuto.");

        setTimeout(() => {
            if (voiceChannel.members.size === 1) { // Sigue vacío
                player.destroy();
                if (textChannel) textChannel.send("👋 Me desconecté por inactividad.");
            }
        }, 60000); // 1 minuto de espera
    }
});

// 🔹 Manejo de errores globales para evitar que el bot crashee
process.on("uncaughtException", (error) => {
    console.error("❌ Error no manejado:", error);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Promesa rechazada sin manejar:", reason);
});

client.login(process.env.TOKEN);
